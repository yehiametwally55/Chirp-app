import React, {useState, useEffect} from 'react';
import './App.css';
import { withAuthenticator, WithAuthenticatorProps } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
  Container, AppBar, Toolbar, Typography, Button, TextField, Card,
  CardContent, CardHeader, Avatar, Box, CircularProgress, SxProps, Theme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { blue } from '@mui/material/colors';
interface Chirp {
  id: number;
  username: string;
  content: string;
  timestamp: string;
}

const API_URL = 'http://Infras-Chirp-cvyblJdbFvmL-921442107.ca-central-1.elb.amazonaws.com/api/chirps'
const glassmorphismStyle: SxProps<Theme> = {
  bgcolor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  borderRadius: 4,
};
function App({signOut, user}: WithAuthenticatorProps) {
  const [chirps, setChirps] = useState<Chirp[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const username = user?.username || 'User';

 const fetchChirps = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setChirps(data);
      }
    } catch (error) {
      console.error("Failed to fetch chirps:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChirps();
  }, []);

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    if(!content.trim()) return;

    try{
      const session = await fetchAuthSession();
      const jwtToken = session.tokens?.idToken?.toString();
      if (!jwtToken) {
      console.error("Authentication token not found.");
      return;
    }
      const response = await fetch(API_URL, {
        method:'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({content}),
      });
      if (response.ok){
        setContent('');
        fetchChirps();
      }
    } catch(error){
      console.error("Failed to post Chirp: ", error);
    }
  };

  return (
    <div className="liquid-background">
      <AppBar position="static" sx={{ ...glassmorphismStyle, boxShadow: 'none', paddingTop: 'env(safe-area-inset-top)'  }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Chirp
          </Typography>
          <Button color="inherit" onClick={signOut}>Sign Out</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ mt: 4, color: 'white' }}>
        <Card sx={{ ...glassmorphismStyle, mb: 4 }}>
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 500 }}>
              Welcome, {username}!
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="What's happening?"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&:hover fieldset': { borderColor: 'white' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiOutlinedInput-input': { color: 'white' }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendIcon />}
                fullWidth
                // --- Replace the sx prop with this ---
                sx={{
                  ...glassmorphismStyle, // Apply the base glass effect
                  color: 'white',
                  fontWeight: 'bold',
                  // Add a hover effect to make it feel interactive
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Brighter on hover
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', // Keep the shadow
                  }
                }}
              >
                Chirp
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress color="inherit" />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {chirps.map((chirp) => (
              <Card key={chirp.id} sx={glassmorphismStyle}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: blue[500], fontWeight: 'bold' }}>
                      {chirp.username.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={<Typography sx={{ fontWeight: 'bold' }}>{chirp.username}</Typography>}
                  subheader={<Typography sx={{ opacity: 0.7 }}>{new Date(chirp.timestamp).toLocaleString()}</Typography>}
                />
                <CardContent>
                  <Typography variant="body1">{chirp.content}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </div>
  );
}

export default withAuthenticator(App);
