import { Outlet } from "react-router-dom";
import { Container, Toolbar } from '@mui/material';
import { AppBar, Typography } from "@mui/material";
import Profile from "./components/Profile";
import { Box } from "@mui/system";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: '#7952B3',
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    }
  }
});

function Layout() {
  return <ThemeProvider theme={theme}>
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="inherit" className="app-bar" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Global funding for local impact!
            </Typography>
            <Profile />
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
    <Container className="page">
      <Outlet />
    </Container>
  </ThemeProvider>
}

export default Layout;