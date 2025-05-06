export default function ListingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="flex grow flex-col">{children}</main>
    </>
  );
}
