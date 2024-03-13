import React from 'react';
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { Helmet } from "react-helmet-async";
import CookieConsent from "react-cookie-consent"; // Import CookieConsent

import { HeroSection } from "./sections/hero";

export const HomePage = () => {
  const { i18n } = useLingui();

  return (
    <main className="relative isolate bg-background">
      <Helmet prioritizeSeoTags>
        <html lang={i18n.locale} />

        <title>
          {t`Bot About Me`} - {t`A space to share a bot about you based on your profile/resume`}
        </title>

        <meta
          name="description"
          content="A free resume builder that simplifies the process of creating, updating, and creating a bot about your resume."
        />
      </Helmet>

      <HeroSection />

      {/* Your other sections here */}

      {/* Cookie Consent */}
      <CookieConsent
        location="bottom"
        buttonText={t`I agree`}
        cookieName="userConsentCookie"
        style={{ background: "#2B373B" }}
        buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
        expires={150}
        // Additional props as needed
      >
        {t`We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.`}
      </CookieConsent>
    </main>
  );
};
