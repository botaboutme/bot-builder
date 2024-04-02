import { t } from "@lingui/macro";
import { Book, SignOut } from "@phosphor-icons/react";
import { Button } from "@reactive-resume/ui";
import { Link } from "react-router-dom";

import { useLogout } from "@/client/services/auth";
import { useAuthStore } from "@/client/stores/auth";
import ReactGA from "react-ga4";

export const logData = () => {
  // Send a custom event
  ReactGA.event({
    category: "ButtonClickAnalysis",
    action: "GoToDashboard",
    label: "Go to dashboard", // optional
    value: 99, // optional, must be a number
    nonInteraction: true, // optional, true/false
    transport: "xhr", // optional, beacon/xhr/image
  });
};

export const HeroCTA = () => {
  const { logout } = useLogout();

  const isLoggedIn = useAuthStore((state) => !!state.user);

  if (isLoggedIn) {
    return (
      <>
        <Button className="btn-bckMain" asChild size="lg">
          <Link
            className="btn-bckMain"
            to="/dashboard"
            onClick={() => logData()}
          >{t`Go to Dashboard`}</Link>
        </Button>

        <Button size="lg" variant="link" onClick={() => logout()}>
          <SignOut className="mr-3" />
          {t`Logout`}
        </Button>
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <Button asChild size="lg">
          <Link to="/auth/login">{t`Get Started`}</Link>
        </Button>

        <Button asChild size="lg" variant="link">
          <a href="https://docs.rxresu.me" target="_blank" rel="noopener noreferrer nofollow">
            <Book className="mr-3" />
            {t`Learn more`}
          </a>
        </Button>
      </>
    );
  }

  return null;
};
