import { useRef } from 'react';
import { Form, Modal } from 'antd';
import { Link } from 'react-router-dom';
import { useMutation } from 'react-query';
import { assignUser } from '../accountService';
import { notifyService } from '../../../../services/notifyService';
import { useGetSocialGroups } from '../../social-network/socialNetworkService';
import ClassicSelect from '../../../../components/shared/antd/Select/Classic';
import Hint from '../../../../components/shared/element/Hint';
import Title from '../../../../components/shared/element/Title';

export default function AssignUserModal(props) {
  const { open, close, userList = [] } = props;

  const firstRender = useRef(true);
  const { data: socialList, isFetching: socialListFetching } =
    useGetSocialGroups(firstRender.current);
  firstRender.current = false;

  const [assignUserForm] = Form.useForm();
  const useAssignUser = useMutation(assignUser, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Assign user succesfully',
        });
        handleClose();
        document.getElementById('refresh-table').click();
      }
    },
  });
  function handleSubmit(value) {
    useAssignUser.mutate({
      users: userList?.map((item) => {
        return item?.id;
      }),
      tabs: value?.pages,
    });
  }

  function handleClose() {
    close();
    assignUserForm.resetFields();
  }

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      maskClosable={false}
      onOk={() => {
        assignUserForm.submit();
      }}
      okButtonProps={{
        loading: useAssignUser.isLoading,
      }}
      cancelButtonProps={{
        loading: useAssignUser.isLoading,
      }}
      destroyOnClose
    >
      <Title>Please choose your social page</Title>
      <br />
      <Form
        name="assisgn-user-form"
        autoComplete="off"
        size="large"
        form={assignUserForm}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="pages"
          rules={[
            {
              required: true,
              message: 'Page is required',
            },
          ]}
        >
          <ClassicSelect
            multiple
            options={socialList?.map((item) => {
              return {
                label: item?.name,
                value: item?.id,
              };
            })}
            loading={socialListFetching}
          />
        </Form.Item>
      </Form>
      <Hint
        message={
          <>
            <span>
              You are currently selected <b>{userList?.length}</b>{' '}
              users.
            </span>
            <br />
            <span>
              If you don't see the page you want, please connect the
              page to the system first by clicking{' '}
              <Link to="/social-network/pages-management">here</Link>.
            </span>
          </>
        }
      />
      <br />
    </Modal>
  );
}
