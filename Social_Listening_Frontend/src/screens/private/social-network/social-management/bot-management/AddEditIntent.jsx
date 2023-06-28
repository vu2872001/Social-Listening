import { useState, useRef } from 'react';
import { Form, Input, Switch, Table, Button } from 'antd';
import { utils, write } from 'xlsx';
import {
  PlusCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useMutation } from 'react-query';
import { notifyService } from '../../../../../services/notifyService';
import {
  createDialogflowIntent,
  updateDialogflowIntent,
} from '../../socialNetworkService';
import useEffectOnce from '../../../../../components/hooks/useEffectOnce';
import useUpdateEffect from '../../../../../components/hooks/useUpdateEffect';
import AddEditWrapper from '../../../../../components/shared/antd/Table/Drawer/AddEditWrapper';
import ToolTipWrapper from '../../../../../components/shared/antd/ToolTipWrapper';
import UploadFile from '../../../../../components/shared/antd/Table/Utils/UploadFile';
import IconButton from '../../../../../components/shared/element/Button/IconButton';
import UploadButton from '../../../../../components/shared/element/Button/UploadButton';

export default function AddEditIntent(props) {
  const {
    open,
    onClose,
    selectedData,
    action,
    agentId,
    hadFallback = false,
    dialogflowConfig,
  } = props;

  const [addEditIntentForm] = Form.useForm();
  const [fallBack, setFallBack] = useState(selectedData?.is_fallback);
  const [trainings, setTrainings] = useState(
    selectedData?.training_phrases?.map((item) => {
      return {
        parts: item?.parts[0]?.text,
        key: crypto.randomUUID(),
      };
    }) ?? []
  );
  useUpdateEffect(() => {
    if (trainings?.length > 0) {
      addEditIntentForm.setFieldValue('training', null);
    }
  }, [trainings]);
  const addNewTraining = (value) => {
    if (value) {
      setTrainings((old) => {
        return [
          {
            parts: value,
            key: crypto.randomUUID(),
          },
          ...old,
        ];
      });
    }
  };

  // #region excel files
  const dumpImportData = [
    {
      intent: 'Hello',
    },
    {
      intent: 'Hi',
    },
    {
      intent: 'Good morning',
    },
    {
      intent: 'Good Afternoon',
    },
    {
      intent: 'Nice to meet you',
    },
  ];

  const [downloadUrl, setDownloadUrl] = useState(null);
  function generateExcelFile(data) {
    // write data to excel
    const workbook = utils.book_new(); // create workbook
    const worksheet = utils.json_to_sheet([]); //create worksheet
    // write first row (header)
    utils.sheet_add_aoa(worksheet, [['Intent']]);
    // write second row to end (data)
    utils.sheet_add_json(worksheet, data, {
      origin: 'A2',
      skipHeader: true,
    });
    // append to sheet 1
    utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const file = write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    // Create url
    setDownloadUrl(window.URL.createObjectURL(new Blob([file])));
  }

  function getDataFromFile(_, excelHeader, excelData) {
    setTrainings((old) => {
      return [
        ...excelData?.map((item) => {
          return {
            parts: item[excelHeader[0]],
            key: crypto.randomUUID(),
          };
        }),
        ...old,
      ];
    });
  }
  // #endregion

  useEffectOnce(() => {
    generateExcelFile(dumpImportData);

    addEditIntentForm.setFieldsValue({
      name: selectedData?.display_name,
      priority: selectedData?.priority ?? 500000,
      description: selectedData?.description,
    });
  });

  const useCreateIntent = useMutation(createDialogflowIntent, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Create intent successfully',
        });
        closeDrawer();
      }
    },
  });

  const useUpdateIntent = useMutation(updateDialogflowIntent, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Update intent successfully',
        });
        closeDrawer();
      }
    },
  });
  function handleSubmit(value) {
    if (action === 'Add') {
      useCreateIntent.mutate({
        dialogflowConfig: dialogflowConfig,
        id: agentId,
        body: {
          display_name: value?.name,
          description: value?.description,
          priority: +value?.priority,
          is_fallback: fallBack,
          training_phrases: trainings?.map((item) => {
            return {
              parts: [{ text: item.parts }],
              repeat_count: 1,
            };
          }),
        },
      });
    } else if (action === 'Edit') {
      let id = null;
      if (selectedData) {
        const splitName = selectedData?.name?.split('/');
        id = splitName[splitName?.length - 1];
      }

      useUpdateIntent.mutate({
        dialogflowConfig: dialogflowConfig,
        agentId: agentId,
        intentId: id,
        body: {
          display_name: value?.name,
          description: value?.description,
          priority: +value?.priority,
          is_fallback: fallBack,
          training_phrases: trainings?.map((item) => {
            return {
              parts: [{ text: item.parts }],
              repeat_count: 1,
            };
          }),
        },
      });
    }
  }

  function closeDrawer() {
    onClose();
    addEditIntentForm.resetFields();
  }

  return (
    <AddEditWrapper
      open={open}
      onClose={closeDrawer}
      form={addEditIntentForm}
      loading={useCreateIntent.isLoading || useUpdateIntent.isLoading}
    >
      <Form
        form={addEditIntentForm}
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

        <Form.Item label="Description" name="description">
          <Input.TextArea
            allowClear
            autoSize={{ minRows: 3, maxRows: 3 }}
          />
        </Form.Item>

        <Form.Item label="Priority" name="priority">
          <Input type="number" allowClear min={0} step={1000} />
        </Form.Item>

        <ToolTipWrapper
          tooltip="Turn on will make return this intent when it don't understand"
          placement="left"
        >
          <Form.Item name="isFallback">
            <>
              <span style={{ marginRight: '1.2rem' }}>Fallback</span>
              <Switch
                checked={fallBack}
                onChange={(change) => {
                  setFallBack(change);
                }}
                disabled={hadFallback}
              />
            </>
          </Form.Item>
        </ToolTipWrapper>

        <ToolTipWrapper
          tooltip="Type a training phrases and press Enter (or click the icon at the end)"
          placement="left"
        >
          <Form.Item
            label="Training Phrases"
            name="training"
            rules={[
              {
                required: true,
                validator: () => {
                  if (!trainings?.length) {
                    return Promise.reject('Training is required');
                  } else {
                    return Promise.resolve();
                  }
                },
              },
            ]}
          >
            <Input
              allowClear
              suffix={
                <PlusCircleOutlined
                  style={{
                    color: 'var(--primary-color)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    addNewTraining(
                      addEditIntentForm.getFieldValue('training')
                    );
                  }}
                />
              }
              onPressEnter={(e) => {
                addNewTraining(e.currentTarget.value);
              }}
            />
          </Form.Item>
        </ToolTipWrapper>
      </Form>

      <div
        className="flex-center"
        style={{ justifyContent: 'flex-start', gap: '1.2rem' }}
      >
        <UploadFile getDataFromFile={getDataFromFile}>
          <ToolTipWrapper
            tooltip="Only excel files (.xlsx, .xls) are allowed"
            placement="left"
          >
            <UploadButton>Upload</UploadButton>
          </ToolTipWrapper>
        </UploadFile>

        <a href={downloadUrl} download="intent-example.xlsx">
          <Button>Download Example File</Button>
        </a>
      </div>
      <Table
        columns={[
          { title: 'Parts', dataIndex: 'parts' },
          {
            dataIndex: 'action',
            key: 'action',
            render: (_, value) => {
              return (
                <IconButton
                  icon={<DeleteOutlined />}
                  tooltip="Remove this pharse"
                  placement="left"
                  onClick={() => {
                    setTrainings((old) => {
                      let newTrainings = old?.filter(
                        (item) => item?.key !== value?.key
                      );

                      return newTrainings;
                    });
                  }}
                />
              );
            },
            width: 40,
          },
        ]}
        dataSource={trainings}
        pagination={{
          showSizeChanger: false,
          pageSize: 5,
        }}
        showHeader={false}
        size="small"
      />
    </AddEditWrapper>
  );
}
