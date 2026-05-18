import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Subjects from "./pages/Subjects";
import UploadPage from "./pages/Upload";
import CoursewareDetail from "./pages/CoursewareDetail";
import AdminReviewPage from "./pages/AdminReview";
import AIAssistant from "./pages/AIAssistant";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/subjects"} component={Subjects} />
      <Route path={"/upload"} component={UploadPage} />
      <Route path={"/courseware/:id"} component={CoursewareDetail} />
      <Route path={"/admin/review"} component={AdminReviewPage} />
      <Route path={"/ai"} component={AIAssistant} />
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
