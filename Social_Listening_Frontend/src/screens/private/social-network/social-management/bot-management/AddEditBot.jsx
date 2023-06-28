import { Form, Input } from 'antd';
import { useMutation } from 'react-query';
import { notifyService } from '../../../../../services/notifyService';
import {
  createDialogflowBot,
  updateDialogflowBot,
} from '../../socialNetworkService';
import useEffectOnce from '../../../../../components/hooks/useEffectOnce';
import AddEditWrapper from '../../../../../components/shared/antd/Table/Drawer/AddEditWrapper';
import ToolTipWrapper from '../../../../../components/shared/antd/ToolTipWrapper';

export default function AddEditBot(props) {
  const {
    open,
    onClose,
    selectedData,
    action,
    pageId,
    dialogflowConfig,
  } = props;

  const [addEditBotForm] = Form.useForm();
  const useCreateDialogflowBot = useMutation(createDialogflowBot, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Create bot successfully',
        });
        closeDrawer();
      }
    },
  });

  const useUpdateDialogflowBot = useMutation(updateDialogflowBot, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Update bot successfully',
        });
        closeDrawer();
      }
    },
  });

  useEffectOnce(() => {
    let formatName = selectedData?.display_name;
    if (formatName?.includes(`-${pageId}`)) {
      formatName = formatName.substring(0, formatName.length - 37);
    }

    addEditBotForm.setFieldsValue({
      name: formatName,
      language: 'English',
    });
  });

  function handleSubmit(value) {
    if (action === 'Add') {
      useCreateDialogflowBot.mutate({
        dialogflowConfig: dialogflowConfig,
        name: `${value?.name}-${pageId}`,
      });
    } else if (action === 'Edit') {
      let id = null;
      if (selectedData) {
        const splitName = selectedData?.name?.split('/');
        id = splitName[splitName?.length - 1];
      }

      useUpdateDialogflowBot.mutate({
        dialogflowConfig: dialogflowConfig,
        id: id,
        name: `${value?.name}-${pageId}`,
      });
    }
  }

  function closeDrawer() {
    onClose();
    addEditBotForm.resetFields();
  }

  return (
    <AddEditWrapper
      open={open}
      onClose={closeDrawer}
      form={addEditBotForm}
      loading={
        useCreateDialogflowBot.isLoading ||
        useUpdateDialogflowBot.isLoading
      }
    >
      <Form
        form={addEditBotForm}
        name="add-edit-workflow-form"
        layout="vertical"
        autoComplete="off"
        onFinish={handleSubmit}
      >
        <ToolTipWrapper
          tooltip="Name must be lower or equal to 150 letters"
          placement="left"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: 'Name is required',
              },
              {
                max: 150,
                message: 'Name must be lower or equal to 150 letters',
              },
            ]}
          >
            <Input allowClear />
          </Form.Item>
        </ToolTipWrapper>

        <ToolTipWrapper
          tooltip="Currently only support English"
          placement="left"
        >
          <Form.Item
            label="Language"
            name="language"
            rules={[
              {
                required: true,
                message: 'Language is required',
              },
            ]}
          >
            <Input disabled />
          </Form.Item>
        </ToolTipWrapper>
      </Form>
    </AddEditWrapper>
  );
}
