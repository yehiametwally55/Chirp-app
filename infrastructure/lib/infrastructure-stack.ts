import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'ChirpVpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DBSecurityGroup', {
      vpc,
      description: 'Allow postgres access from ECS tasks',
      allowAllOutbound: true,
    });

    const fargateSecurityGroup = new ec2.SecurityGroup(this, 'FargateSG', {
      vpc,
      description: 'Security group for ECS tasks',
      allowAllOutbound: true,
    });
    dbSecurityGroup.addIngressRule(
      fargateSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow ECS tasks to connect to Postgres'
    );

    const database = new rds.DatabaseInstance(this, 'ChirpDatabase', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, 
      },
      publiclyAccessible: false, 
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_13,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      credentials: rds.Credentials.fromPassword(
        'chirp_user',
        cdk.SecretValue.unsafePlainText('yourSuperSecurePassword123')
      ),
      databaseName: 'chirp_db',
      securityGroups: [dbSecurityGroup],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const cluster = new ecs.Cluster(this, 'ChirpCluster', { vpc });

    const backendRepo = ecr.Repository.fromRepositoryName(this, 'BackendRepo', 'chirp-backend');

    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      'ChirpFargateService',
      {
        cluster,
        taskImageOptions: {
          image: ecs.ContainerImage.fromEcrRepository(backendRepo),
          environment: {
            DATABASE_HOST: database.dbInstanceEndpointAddress,
            POSTGRES_USER: 'chirp_user',
            POSTGRES_PASSWORD: 'yourSuperSecurePassword123',
            POSTGRES_DB: 'chirp_db',
          },
          containerPort: 8080,
        },
        securityGroups: [fargateSecurityGroup],
        publicLoadBalancer: true,
      }
    );

    fargateService.targetGroup.configureHealthCheck({
      path: '/api/chirps', 
      port: '8080',
      healthyHttpCodes: '200-399',
    });
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: fargateService.loadBalancer.loadBalancerDnsName,
    });
  }
}
