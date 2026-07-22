export default function Lyout(props: LayoutProps<"/">) {
  return <main className="@container min-h-screen">{props.children}</main>;
}
