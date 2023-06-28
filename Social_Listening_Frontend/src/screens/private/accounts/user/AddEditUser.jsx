import { useRef } from 'react';
import { Form, Input, Radio } from 'antd';
import { useMutation, useQueryClient } from 'react-query';
import {
  gender,
  role,
} from '../../../../constants/environment/environment.dev';
import { notifyService } from '../../../../services/notifyService';
import {
  createAccount,
  editAccount,
  updatePassword,
  updateYourAccount,
} from '../accountService';
import {
  getRole,
  useGetAllRole,
} from '../../../../routes/private/privateService';
import useEffectOnce from '../../../../components/hooks/useEffectOnce';
import AddEditWrapper from '../../../../components/shared/antd/Table/Drawer/AddEditWrapper';
import ClassicSelect from '../../../../components/shared/antd/Select/Classic';
import ToolTipWrapper from '../../../../components/shared/antd/ToolTipWrapper';

export default function AddEditUser(props) {
  const { open, onClose, selectedData, action } = props;

  const [addEditUserForm] = Form.useForm();
  const queryClient = useQueryClient();
  const userData = queryClient.getQueryData('userData');
  const { data } = useGetAllRole(userData?.role === 'ADMIN');
  const roleData = useRef(data);

  const useGetAvailableRoles = useMutation(getRole, {
    onSuccess: (resp) => {
      roleData.current = resp;
    },
  });

  const useCreateAccount = useMutation(createAccount, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Create new user successfully',
        });
        closeDrawer();
      }
    },
  });

  const useEditAccount = useMutation(editAccount, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Save user successfully',
        });
        closeDrawer();
      }
    },
  });

  const canUpdatePassword = useRef(false);
  const useUpdateYourAccount = useMutation(updateYourAccount, {
    onSuccess: (resp) => {
      if (resp) {
        if (
          canUpdatePassword.current?.oldPassword &&
          canUpdatePassword.current?.newPassword
        ) {
          useUpdatePassword.mutate(canUpdatePassword.current);
        } else {
          notifyService.showSucsessMessage({
            description: 'Save user successfully',
          });
          closeDrawer();
        }
      }
    },
  });
  const useUpdatePassword = useMutation(updatePassword, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Save user successfully',
        });
        closeDrawer();
      }
    },
  });

  useEffectOnce(() => {
    if (userData?.role !== 'ADMIN') {
      useGetAvailableRoles.mutate();
    }

    let role = selectedData?.role?.roleName;
    if (action === 'Add') {
      if (userData?.role === 'ADMIN') {
        role = 'Admin';
      } else if (userData?.role === 'OWNER') {
        role = 'Supporter';
      }
    }

    addEditUserForm.setFieldsValue({
      email: selectedData?.email,
      userName: selectedData?.userName,
      fullName: selectedData?.fullName,
      phoneNumber: selectedData?.phoneNumber,
      role: role,
      gender: selectedData?.gender ?? 'Other',
    });
  });

  async function handleSubmit(value) {
    if (action === 'Add') {
      roleData.current = roleData.current ?? data;

      const formatValue = {
        ...value,
        roleId: roleData.current?.filter(
          (r) =>
            r.roleName?.toLowerCase() === value.role.toLowerCase()
        )[0]?.id,
      };
      delete formatValue.role;
      delete formatValue.confirmPassword;

      useCreateAccount.mutate({
        role: userData?.role,
        data: formatValue,
      });
    } else if (action === 'Edit') {
      if (selectedData?.id === userData?.id) {
        canUpdatePassword.current = {
          oldPassword: value?.password,
          newPassword: value?.confirmPassword,
        };
        useUpdateYourAccount.mutate(value);
      } else {
        useEditAccount.mutate({ ...value, id: selectedData?.id });
      }
    }
  }

  function closeDrawer() {
    onClose();
    addEditUserForm.resetFields();
  }

  return (
    <AddEditWrapper
      open={open}
      onClose={closeDrawer}
      form={addEditUserForm}
      loading={
        useCreateAccount.isLoading ||
        useEditAccount.isLoading ||
        useUpdatePassword.isLoading ||
        useUpdateYourAccount.isLoading
      }
    >
      <Form
        form={addEditUserForm}
        name="add-edit-user-form"
        layout="vertical"
        autoComplete="off"
        onFinish={handleSubmit}
      >
        <ToolTipWrapper
          tooltip="Only email is allowed"
          placement="left"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: 'Email is required',
              },
              {
                type: 'email',
                message: 'Only email is allowed',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </ToolTipWrapper>

        {(action === 'Add' || selectedData?.id === userData?.id) && (
          <>
            <ToolTipWrapper
              tooltip="Password must between 8 - 50"
              placement="left"
            >
              <Form.Item
                label={action === 'Add' ? 'Password' : 'Old Password'}
                name="password"
                {...(selectedData?.id !== userData?.id && {
                  rules: [
                    {
                      required: true,
                      validator: (_, value) => {
                        let errorMsg = 'Password is required';
                        if (
                          value?.length >= 8 &&
                          value?.length <= 50
                        ) {
                          return Promise.resolve();
                        }
                        // if it not between 8 - 50, check it has value or not
                        // if it has value -> user already input the field
                        if (value?.length > 0) {
                          errorMsg = 'Password must between 8 - 50';
                        }
                        return Promise.reject(errorMsg);
                      },
                    },
                  ],
                })}
              >
                <Input.Password />
              </Form.Item>
            </ToolTipWrapper>

            <ToolTipWrapper
              tooltip="Confirm password must match"
              placement="left"
            >
              <Form.Item
                label={
                  action === 'Add'
                    ? 'Confirm Password'
                    : 'New Password'
                }
                name="confirmPassword"
                {...(selectedData?.id !== userData?.id && {
                  rules: [
                    {
                      required: true,
                      message: 'Confirm Password is required',
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          !value ||
                          getFieldValue('password') === value
                        ) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            'The confirm password do not match'
                          )
                        );
                      },
                    }),
                  ],
                })}
              >
                <Input.Password />
              </Form.Item>
            </ToolTipWrapper>
          </>
        )}

        <ToolTipWrapper
          {...(action === 'Add'
            ? {
                tooltip: `You can only create ${addEditUserForm.getFieldValue(
                  'role'
                )} accounts`,
              }
            : {
                tooltip: 'You can not change this account role',
              })}
          placement="left"
        >
          <Form.Item label="Role" name="role">
            <ClassicSelect disabled options={role} />
          </Form.Item>
        </ToolTipWrapper>

        <Form.Item
          label="User Name"
          name="userName"
          rules={[
            {
              required: true,
              message: 'User name is required',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[
            {
              required: true,
              message: 'Full Name is required',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Gender" name="gender">
          <Radio.Group options={gender} />
        </Form.Item>

        <ToolTipWrapper
          tooltip="Only 10-digit phone number allowed"
          placement="left"
        >
          <Form.Item
            label="Phone"
            name="phoneNumber"
            rules={[
              {
                pattern: /^\d{10}$/,
                message: 'Phone number is not valid',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </ToolTipWrapper>
      </Form>
    </AddEditWrapper>
  );
}
