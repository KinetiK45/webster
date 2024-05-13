import theme from "./Theme";
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import {ThemeProvider} from "@mui/material";
import {SnackbarProvider} from "notistack";
import {lazy} from "react";
import RootLayout from "./RootLayout";
import AuthLayout from "./pages/auth/AuthLayout";
import Error from "./Error";
import Login from "./pages/auth/Login";
import {Test} from "./pages/editor/Test";

// const Login = lazy(() => import("./pages/auth/Login"));
const Registration = lazy(() => import("./pages/auth/Registration"));
const PasswordRecovery = lazy(() => import("./pages/auth/PasswordRecovery"));
const PasswordReset = lazy(() => import("./pages/auth/PasswordReset"));



function App() {
  const router = createBrowserRouter(
      createRoutesFromElements(
          <Route path="/" element={<RootLayout />}>
            <Route path="auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="registration" element={<Registration />} />
              <Route path="password-recovery" element={<PasswordRecovery />} />
              <Route path="password-reset/:token" element={<PasswordReset />} />
            </Route>
              <Route path="editor" element={<Test />} />
          </Route>
      )
  );

  return (
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <RouterProvider router={router}/>
        </SnackbarProvider>
      </ThemeProvider>
  );
}

export default App;
