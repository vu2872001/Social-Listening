import { CheckCircleTwoTone } from '@ant-design/icons';

export default function BooleanRow(props) {
  const { active = false, ...other } = props;

  return (
    <>
      {active ? (
        <CheckCircleTwoTone
          twoToneColor="#28a745"
          style={{ fontSize: '2.4rem' }}
          {...other}
        />
      ) : null}
    </>
  );
}
