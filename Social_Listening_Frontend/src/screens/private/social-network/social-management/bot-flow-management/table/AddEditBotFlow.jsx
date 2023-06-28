import { Form, Input } from 'antd';
import { useMutation } from 'react-query';
import {
  createBotFlow,
  updateBotFlow,
} from '../../../socialNetworkService';
import { notifyService } from '../../../../../../services/notifyService';
import useEffectOnce from '../../../../../../components/hooks/useEffectOnce';
import AddEditWrapper from '../../../../../../components/shared/antd/Table/Drawer/AddEditWrapper';
import ClassicSelect from '../../../../../../components/shared/antd/Select/Classic';

export default function AddEditBotFlow(props) {
  const {
    open,
    onClose,
    selectedData,
    action,
    pageId,
    getCurrentFlow,
  } = props;

  const [addEditWorkflowForm] = Form.useForm();
  const useCreateBotFlow = useMutation(createBotFlow, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Create bot flow successfully',
        });
        closeDrawer();
        getCurrentFlow(resp);
      }
    },
  });

  const useUpdateBotFlow = useMutation(updateBotFlow, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Create bot flow successfully',
        });
        closeDrawer();
      }
    },
  });

  useEffectOnce(() => {
    addEditWorkflowForm.setFieldsValue({
      name: selectedData?.name,
      type: selectedData?.type
    });
  });

  function handleSubmit(value) {
    if (action === 'Add') {
      useCreateBotFlow.mutate({
        name: value?.name,
        type: value?.type,
        tabId: pageId,
        data: {
          nodes: [
            {
              id: crypto.randomUUID(),
              type: 'Receive',
              position: {
                x: 10,
                y: 50,
              },
              data: {
                type: value?.type
              }
            },
          ],
          edges: [],
          variables: [],
        },
      });
    } else if (action === 'Edit') {
      let extendData = null;
      if (selectedData?.extendData) {
        extendData = JSON.parse(selectedData.extendData);
      }
      
      extendData.nodes = extendData.nodes.map(nd => {
        if(nd.type === 'Receive') {
          nd.data.type = value?.type
        }
        return nd;
      })

      useUpdateBotFlow.mutate({
        id: selectedData?.id,
        body: {
          name: value?.name,
          type: value?.type,
          tabId: pageId,
          data: extendData,
        },
      });
    }
  }

  function closeDrawer() {
    onClose();
    addEditWorkflowForm.resetFields();
  }

  return (
    <AddEditWrapper
      open={open}
      onClose={closeDrawer}
      form={addEditWorkflowForm}
      loading={
        useCreateBotFlow.isLoading || useUpdateBotFlow.isLoading
      }
    >
      <Form
        form={addEditWorkflowForm}
        name="add-edit-workflow-form"
        layout="vertical"
        autoComplete="off"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            {
              required: true,
              message: 'Name is required',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Type"
          name="type"
          rules={[
            {
              required: true,
              message: 'Type is required',
            },
          ]}
        >
          <ClassicSelect
            options={[
              {
                label: 'Comment',
                value: 'Comment',
              },
              {
                label: 'Chat',
                value: 'Message',
              },
            ]}
          />
        </Form.Item>
      </Form>
    </AddEditWrapper>
  );
}
