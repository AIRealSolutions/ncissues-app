import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import FindLegislator from "./pages/FindLegislator";
import Legislators from "./pages/Legislators";
import Committees from "./pages/Committees";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/find-legislator"} component={FindLegislator} />
      <Route path={"/legislators"} component={Legislators} />
      <Route path={"/committees"} component={Committees} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
