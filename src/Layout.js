import { Outlet } from "react-router-dom";
import { Container, Dialog, DialogContent, IconButton, Toolbar } from '@mui/material';
import { AppBar, Typography } from "@mui/material";
import Profile from "./components/Profile";
import { Box } from "@mui/system";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import HelpIcon from '@mui/icons-material/Help';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { loadNotionContent } from "./Utils";
import { useUIHelper } from "./context/UIHelperContext";
import { NotionRenderer } from "react-notion";

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
  const [isHelp, setHelp] = useState(false);
  const [notionContent, setNotionContent] = useState({});
  const { setBackdropState } = useUIHelper();
  const closeDialog = function() {
    setHelp(false);
  }
  useEffect(() => {
    setBackdropState(true);
    async function fn(){
      setNotionContent(await loadNotionContent(axios,"07a8e3b83c7b49ff928c6a690d21a19f"));
      setBackdropState(false);
      setHelp(true);
    }
    fn();
  }, [setBackdropState])
  return <ThemeProvider theme={theme}>
    <Dialog open={isHelp} onClose={closeDialog} sx={{minWidth:"768px"}}>
      <DialogContent>
        <NotionRenderer blockMap={notionContent} fullPage={true} hideHeader={true} />
      </DialogContent>
    </Dialog>
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="inherit" className="app-bar" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Global funding for local impact!
            </Typography>
            <IconButton sx={{marginRight: "16px"}} color="primary" aria-label="show help"
              onClick={() => {
                setHelp(true);
              }}>
              <HelpIcon />
            </IconButton>
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