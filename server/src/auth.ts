import type { Request } from 'express';
import type { Response } from 'express';
import type { NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

export interface AuthenticatedRequest extends Request {
    user?: {
        username: string,
        sub: string,
    };
}

const verifier = CognitoJwtVerifier.create({
    userPoolId: 'us-east-1_MevnGRCCm',
    tokenUse: 'id',
    clientId: '76arnj70d89j9956t37s1ojvta',
});

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({error: 'Authorization header is missing or malformed.'});
    }
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token is missing.' });
    }

    try{
        const payload = await verifier.verify(token);
        req.user = {
            username: payload['cognito:username'] as string,
            sub: payload.sub as string
        };
        next();
    } catch(error){
        console.error("Token verification failed: ", error);
        return res.status(401).json({error: 'Invalid Token'});
    }
};
