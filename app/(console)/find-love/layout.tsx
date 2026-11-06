export default function FindLoveLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.add("find-love")`,
        }}
      />
      {children}
    </>
  );
}
