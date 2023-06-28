import { useState, useRef } from 'react';
import { Form } from 'antd';
import { useMutation } from 'react-query';
import { notifyService } from '../../../../services/notifyService';
import {
  assignPermission,
  getAllPermission,
  getPermissionByScreens,
  getScreens,
} from '../accountService';
import { useGetAllRole } from '../../../../routes/private/privateService';
import useEffectOnce from '../../../../components/hooks/useEffectOnce';
import useUpdateEffect from '../../../../components/hooks/useUpdateEffect';
import AddEditWrapper from '../../../../components/shared/antd/Table/Drawer/AddEditWrapper';
import ToolTipWrapper from '../../../../components/shared/antd/ToolTipWrapper';
import ClassicSelect from '../../../../components/shared/antd/Select/Classic';
import Hint from '../../../../components/shared/element/Hint';

export default function AddEditPermissions(props) {
  const { open, onClose, action } = props;

  const [addEditPermissionForm] = Form.useForm();
  const canGetRole = useRef(true);
  const { data: allRole } = useGetAllRole(canGetRole.current);
  canGetRole.current = false;

  // #region get all screens and all permissions
  const [screens, setScreens] = useState([]);
  const useGetScreens = useMutation(getScreens, {
    onSuccess: (resp) => {
      if (resp) {
        setScreens(
          resp?.map((item) => {
            return {
              label: item.screen,
              value: item.screen,
            };
          })
        );
      }
    },
  });
  // #endregion

  // #region get permission by screen
  function handleSelectScreen(e) {
    useGetPermission.mutate({
      screen: e,
    });
  }
  const [permissionList, setPermissionList] = useState([]);
  const useGetPermission = useMutation(getPermissionByScreens, {
    onSuccess: (resp) => {
      if (resp) {
        setPermissionList(
          resp?.map((item) => {
            return {
              label: item.displayName,
              value: item.id,
              screen: item.screen,
            };
          })
        );
      }
    },
  });
  // #endregion

  const allPerm = useRef([]);
  const [permExisted, setPermExisted] = useState([]);
  const [permSelected, setPermSelected] = useState([]);
  const permissionInRole = useRef([]);
  const useGetAllPermission = useMutation(getAllPermission, {
    onSuccess: (resp) => {
      if (resp) {
        allPerm.current = resp;
      }
    },
  });
  useEffectOnce(() => {
    useGetScreens.mutate();
    useGetAllPermission.mutate();
  });
  useUpdateEffect(() => {
    if (permissionList?.length > 0) {
      if (permSelected?.includes('all')) {
        addEditPermissionForm.setFieldValue(
          'listPermission',
          permissionList?.map((item) => item?.value)
        );
      } else {
        addEditPermissionForm.setFieldValue(
          'listPermission',
          permSelected?.map((item) => item)
        );
      }
    } else {
      addEditPermissionForm.setFieldValue('listPermission', []);
      setPermSelected([]);
    }
  }, [permissionList, permExisted]);
  useUpdateEffect(() => {
    permissionInRole.current =
      permExisted?.filter(
        (x) =>
          permissionList.filter((y) => y.value === x.id)?.length > 0
      ) ?? [];

    if (
      permissionList?.length === permissionInRole.current?.length &&
      permissionList?.length > 0
    ) {
      addEditPermissionForm.setFieldValue(
        'listPermission',
        permissionList?.map((item) => item?.value)
      );
      setPermSelected(['all']);
    } else {
      addEditPermissionForm.setFieldValue(
        'listPermission',
        permissionInRole.current?.map((item) => item?.id)
      );
      setPermSelected(
        permissionInRole.current?.map((item) => item?.id)
      );
    }
  }, [permissionList, permExisted]);

  const useAssignPermission = useMutation(assignPermission, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Assign permissions successfully',
        });
        closeDrawer();
      }
    },
  });
  async function handleFinish(value) {
    if (action === 'Add') {
      delete value.screen;
      useAssignPermission.mutate(value);
    }
  }

  function closeDrawer() {
    onClose();
    addEditPermissionForm.resetFields();
  }

  return (
    <AddEditWrapper
      open={open}
      onClose={closeDrawer}
      form={addEditPermissionForm}
      loading={useAssignPermission.isLoading}
    >
      <Hint message="You have to choose screens to get permissions" />
      <br />
      <Form
        form={addEditPermissionForm}
        name="add-edit-user-form"
        layout="vertical"
        autoComplete="off"
        onFinish={handleFinish}
      >
        <Form.Item
          label="Role"
          name="roleId"
          rules={[
            {
              required: true,
              message: 'Role is required',
            },
          ]}
        >
          <ClassicSelect
            placeholder="Select role..."
            options={allRole?.map((item) => {
              return { label: item.roleName, value: item.id };
            })}
            onChange={(e) => {
              setPermExisted(
                allPerm.current
                  ?.filter((item) => item?.role?.id === e)
                  ?.map((item) => item?.permission)
              );
            }}
          />
        </Form.Item>

        <Form.Item
          label="Screens"
          name="screen"
          rules={[
            {
              required: true,
              message: 'Screen(s) is required',
            },
          ]}
        >
          <ClassicSelect
            multiple
            placeholder="Select screens..."
            options={screens}
            onChange={handleSelectScreen}
          />
        </Form.Item>

        <ToolTipWrapper
          tooltip="You have to choose screens to get permissions"
          placement="left"
        >
          <Form.Item
            label="Permissions"
            name="listPermission"
            rules={[
              {
                required: true,
                message: 'Permission(s) is required',
              },
            ]}
          >
            <ClassicSelect
              multiple
              filterLabel
              placeholder="Select permissions..."
              options={permissionList?.map((pl) => {
                return {
                  ...pl,
                  disabled:
                    permissionInRole.current?.filter(
                      (pr) => pr?.id === pl?.value
                    )?.length > 0,
                };
              })}
              loading={useGetPermission.isLoading}
              onChange={(e) => {
                setPermSelected(e);

                if (e?.includes('all')) {
                  addEditPermissionForm.setFieldValue(
                    'listPermission',
                    permissionList?.map((item) => item?.value)
                  );
                }

                if (e?.includes('removeAll')) {
                  addEditPermissionForm.setFieldValue(
                    'listPermission',
                    []
                  );
                }
              }}
              allOption={!permSelected?.includes('all')}
              removeAllOption={permSelected?.includes('all')}
            />
          </Form.Item>
        </ToolTipWrapper>
      </Form>
    </AddEditWrapper>
  );
}
