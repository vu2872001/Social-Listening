import './element.scss';

export default function Title(props) {
  return <h1 id="title" {...props}>{props.children}</h1>;
}
