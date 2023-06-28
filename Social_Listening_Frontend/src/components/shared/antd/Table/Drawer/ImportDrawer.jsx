import { useState, useRef } from 'react';
import { Drawer, Space, Steps } from 'antd';
import { utils, write } from 'xlsx';
import { apiService } from '../../../../../services/apiService';
import { notifyService } from '../../../../../services/notifyService';
import useEffectOnce from '../../../../hooks/useEffectOnce';
import useUpdateEffect from '../../../../hooks/useUpdateEffect';
import useToggle from '../../../../hooks/useToggle';
import CancelButton from '../../../element/Button/CancelButton';
import PreviousButton from '../../../element/Button/PreviousButton';
import UploadButton from '../../../element/Button/UploadButton';
import UploadFile from '../Utils/UploadFile';
import TableMapData from '../Utils/TableMapData';
import Hint from '../../../element/Hint';
import ImportButton from '../../../element/Button/ImportButton';

export default function ImportDrawer(props) {
  const { open, close, apiImport, importColumns, dumpImportData } =
    props;

  // #region generate example excel file
  const [downloadUrl, setDownloadUrl] = useState(null);
  function generateExcelFile(data) {
    // write data to excel
    const workbook = utils.book_new(); // create workbook
    const worksheet = utils.json_to_sheet([]); //create worksheet
    // write first row (header)
    utils.sheet_add_aoa(worksheet, [
      importColumns.map((item) => item.title),
    ]);
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
  useEffectOnce(() => {
    generateExcelFile(dumpImportData);
  });
  // #endregion

  // #region working with excel section
  const propsMapped = useRef([]); // header mapped to table col props
  const file = useRef(null); // file excel
  const header = useRef([]); // headers in excel
  const data = useRef([]); // rows data in excel
  const [colMapped, setColMapped] = useState([]); // header in excel mapped to table
  const [currentStep, setCurrentStep] = useState(0);

  function getDataFromFile(fileExcel, excelHeader, excelData) {
    file.current = fileExcel;
    header.current = excelHeader;
    data.current = excelData[0];
    setCurrentStep(currentStep + 1);
  }

  // map header in excel to props in table
  if (colMapped?.length > 0) {
    propsMapped.current = colMapped
      .map((item) => {
        return {
          header: item.excelHeader,
          props: importColumns.filter(
            (col) => col?.title === item?.systemCol
          )[0]?.dataIndex,
        };
      })
      .filter((item) => item.header);
  }
  // #endregion

  // get any error cols to block next button
  const [hadErrorCol, setHadErrorCol] = useToggle(false);
  useUpdateEffect(() => {
    const checkErrorCol =
      document.querySelectorAll('.required-column.error-column')
        ?.length > 0;
    if (hadErrorCol !== checkErrorCol) {
      setHadErrorCol(checkErrorCol);
    }
  }, [colMapped]);

  async function importFile() {
    const formData = new FormData();
    formData.append('file', file.current);
    formData.append(
      'mappingColumn',
      JSON.stringify(propsMapped.current)
    );

    try {
      closeDrawer();
      notifyService.showWarningMessage({
        isProcessing: true,
        description:
          'Importing is processing, please wait for the success alert',
        duration: 0,
      });
      await apiService.post(apiImport, formData);
    } catch (ex) {
      notifyService.showErrorMessage({ description: ex.message });
    }
  }

  function closeDrawer() {
    close();
    file.current = null;
    header.current = [];
    if (currentStep !== 0) {
      setCurrentStep(0);
    }
  }

  return (
    <Drawer
      destroyOnClose
      maskClosable={false}
      onClose={closeDrawer}
      open={open}
      width={500}
      extra={
        <Space>
          <CancelButton onClick={closeDrawer} />
          {currentStep === 1 && (
            <>
              <PreviousButton
                onClick={() => {
                  if (currentStep === 1) {
                    header.current = [];
                  }
                  setCurrentStep(currentStep - 1);
                }}
              />
              <ImportButton
                type="primary"
                disabled={hadErrorCol}
                onClick={() => {
                  importFile();
                }}
              />
            </>
          )}
        </Space>
      }
    >
      <Steps
        current={currentStep}
        onChange={(value) => {
          if (value === 0) {
            header.current = [];
          }
          setCurrentStep(value);
        }}
        items={[
          {
            title: 'Step 1',
            description: (
              <UploadFile getDataFromFile={getDataFromFile}>
                UPLOAD
              </UploadFile>
            ),
          },
          {
            title: 'Step 2',
            description: 'MAP',
            disabled:
              currentStep === 0 && header.current?.length === 0,
          },
        ]}
      />
      <div className="import-content">
        {currentStep === 0 ? (
          <div className="flex-center first-step">
            <Hint
              message={
                <div className="import-hint">
                  <span>
                    Only excel files (.xlsx, .xls) are allowed.
                  </span>
                  <span>
                    You can download example Excel file{' '}
                    <a href={downloadUrl} download="example.xlsx">
                      here
                    </a>
                    .
                  </span>
                  <span>
                    You must choose file by clicking the Choose file
                    button below.
                  </span>
                </div>
              }
            />
            <UploadFile getDataFromFile={getDataFromFile}>
              <UploadButton>Upload</UploadButton>
            </UploadFile>
          </div>
        ) : (
          <TableMapData
            excelHeader={header.current}
            systemCol={importColumns}
            previewCol={data.current}
            getColMapped={setColMapped}
          />
        )}
      </div>
    </Drawer>
  );
}
