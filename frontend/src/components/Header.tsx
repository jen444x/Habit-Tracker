function Header({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center mb-10">
      <div className="text-5xl mb-4">🌿</div>
      <h1 className="font-heading text-4xl text-calm-900 mb-2">{title}</h1>
      {body && <p className="text-calm-600 text-sm">{body}</p>}
    </div>
  );
}
export default Header;
