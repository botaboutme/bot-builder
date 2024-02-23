import { t } from "@lingui/macro";
import { UploadSimple } from "@phosphor-icons/react"; // Assuming there's an upload icon
import { KeyboardShortcut } from "@reactive-resume/ui";

import { useDialog } from "@/client/stores/dialog";

import { BaseListItem } from "./base-item";

export const UploadResumeListItem = () => {
  const { open } = useDialog("upload"); // Assuming 'upload' is the key for your upload dialog

  return (
    <BaseListItem
      start={<UploadSimple size={18} />}
      onClick={() => open("create")} // Adjust if needed for your dialog opening logic
      title={
        <>
          <span>{t`Upload a new resume`}</span>
          {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
          <KeyboardShortcut className="ml-2">^U</KeyboardShortcut>
        </>
      }
      description={t`Upload your resume in PDF, DOC, or DOCX format.`}
    />
  );
};
