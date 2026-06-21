export default function Lyout(props: LayoutProps<"/">) {
  return (
    <div>
      <main className="@container min-h-screen">{props.children}</main>
    </div>
  );
}
