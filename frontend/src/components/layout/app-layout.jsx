import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "@/components/layout/header.jsx";
import Sidebar from "@/components/layout/sidebar.jsx";
import BreadcrumbsNav from "@/components/layout/breadcrumbs.jsx";

const AppLayout = () => (
  <Box
    sx={{
      display: { xs: "block", md: "flex" },
      minHeight: "100vh",
      backgroundColor: "background.default",
      width: "100%",
    }}
  >
    <Sidebar />
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        ml: { xs: 0, md: "260px" },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <Container maxWidth="lg" sx={{ py: 3, flexGrow: 1, mx: "auto" }}>
        <BreadcrumbsNav />
        <Outlet />
      </Container>
    </Box>
  </Box>
);

export default AppLayout;
