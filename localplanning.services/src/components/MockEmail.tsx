export const MockEmail: React.FC = () => {
  const { origin, search } = window.location;
  const path = `/applications${search}`;
  const magicLink = `${origin}${path}`;

  return (
    <div>
      <p>Use the link to login to localplanning.services</p>
      <a href={path}>{magicLink}</a>
      <p>Do not share these links with anyone else.</p>
    </div>
  )
}
