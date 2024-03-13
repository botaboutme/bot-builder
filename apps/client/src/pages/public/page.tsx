/* eslint-disable lingui/no-unlocalized-strings */
import { CircleNotch, FilePdf } from "@phosphor-icons/react";
import { ResumeDto } from "@reactive-resume/dto";
import { Button } from "@reactive-resume/ui";
import React, { useCallback, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, LoaderFunction, redirect, useLoaderData } from "react-router-dom";

import ChatComponent from "@/client/components/chat-component";
import { ThemeSwitch } from "@/client/components/theme-switch";
import { queryClient } from "@/client/libs/query-client";
import { findResumeByUsernameSlug, usePrintResume } from "@/client/services/resume";

export const PublicResumePage = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const { printResume, loading } = usePrintResume();
  const { id, title, data: resume } = useLoaderData() as ResumeDto;
  const format = resume.metadata.page.format;

  const updateResumeInFrame = useCallback(() => {
    if (!frameRef.current || !frameRef.current.contentWindow) return;
    const message = { type: "SET_RESUME", payload: resume };
    frameRef.current.contentWindow.postMessage(message, "*");
  }, [frameRef, resume]);

  useEffect(() => {
    if (!frameRef.current) return;
    frameRef.current.addEventListener("load", updateResumeInFrame);
    return () => frameRef.current?.removeEventListener("load", updateResumeInFrame);
  }, [frameRef, updateResumeInFrame]);

  useEffect(() => {
    if (!frameRef.current || !frameRef.current.contentWindow) return;

    const handleMessage = (event: MessageEvent) => {
      if (!frameRef.current || !frameRef.current.contentWindow) return;
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "PAGE_LOADED") {
        frameRef.current.width = event.data.payload.width;
        frameRef.current.height = event.data.payload.height;
        frameRef.current.contentWindow.removeEventListener("message", handleMessage);
      }
    };

    frameRef.current.contentWindow.addEventListener("message", handleMessage);

    return () => {
      frameRef.current?.contentWindow?.removeEventListener("message", handleMessage);
    };
  }, [frameRef]);

  const onDownloadPdf = async () => {
    const { url } = await printResume({ id });
    const openInNewTab = (url: string) => {
      const win = window.open(url, "_blank");
      if (win) win.focus();
    };
    openInNewTab(url);
  };

  return (
    <div className="flex h-screen flex-col">
      <Helmet>
        <title>{resume.basics.name} - Reactive Resume</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between bg-gray-100 p-4 shadow">
        <div>
          <h1 className="text-xl font-bold">{resume.basics.name}</h1>
          <p className="text-sm">{resume.basics.headline}</p>
        </div>
        <div className="flex items-center gap-x-4">
          <Button variant="outline" onClick={onDownloadPdf}>
            {loading ? <CircleNotch size={16} className="animate-spin" /> : <FilePdf size={16} />}
            <span>Download PDF</span>
          </Button>
          <ThemeSwitch />
        </div>
      </div>

      {/* Main Area - Adjusted for spacing and overflow */}
      <div className="grow overflow-auto">
        <div
          className="flex flex-col gap-4 p-4 md:flex-row "
          style={{ height: "calc(90vh - 4rem)" }}
        >
          <div className="h-full grow md:w-1/2">
            <div className="h-full overflow-hidden rounded shadow-xl">
              <iframe
                title={title}
                ref={frameRef}
                src="/artboard/preview"
                className="size-full"
                scrolling="yes" // Ensure the iframe allows scrolling
              ></iframe>
            </div>
          </div>

          <div className="h-1/2 grow overflow-auto rounded shadow-xl md:h-full md:w-1/2">
            <ChatComponent />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 p-4 text-center shadow-inner">
        <Link to="/">
          <Button size="sm" variant="ghost">
            <span>Built with Reactive Resume, Powered By BotABoutMe</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export const publicLoader: LoaderFunction<ResumeDto> = async ({ params }) => {
  try {
    const username = params.username as string;
    const slug = params.slug as string;

    const resume = await queryClient.fetchQuery({
      queryKey: ["resume", { username, slug }],
      queryFn: () => findResumeByUsernameSlug({ username, slug }),
    });

    return resume;
  } catch (error) {
    return redirect("/");
  }
};
