export default function EventisLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.remove("find-love")`,
        }}
      />
      {children}
    </>
  );
}
