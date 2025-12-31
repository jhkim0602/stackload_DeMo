import Script from "next/script";

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="/live2d/live2dcubismcore.min.js"
        strategy="beforeInteractive"
      />
      {children}
    </>
  );
}
