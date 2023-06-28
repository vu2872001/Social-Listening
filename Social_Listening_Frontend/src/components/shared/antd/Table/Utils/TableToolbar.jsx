import { apiService } from '../../../../../services/apiService';
import { Getter } from '../../../../../utils/dataGetter';
import useToggle from '../../../../hooks/useToggle';
import ElementWithPermission from '../../../element/ElementWithPermission';
import NewButton from '../../../element/Button/NewButton';
import ImportButton from '../../../element/Button/ImportButton';
import ExportButton from '../../../element/Button/ExportButton';
import DeleteButton from '../../../element/Button/DeleteButton';
import ImportDrawer from '../Drawer/ImportDrawer';

export default function TableToolbar(props) {
  const {
    permission,
    selectAction,
    openAddEdit,
    apiImport,
    importColumns,
    dumpImportData,
    apiExport,
    showDelete,
    deleteMultiple,
    customToolbar,
  } = props;

  const [openImport, setOpenImport] = useToggle(false);

  return (
    <>
      <div className="table-toolbars flex-center">
        <ElementWithPermission permission={permission.new}>
          <NewButton
            onClick={() => {
              selectAction('Add');
              openAddEdit();
            }}
          />
        </ElementWithPermission>

        <ElementWithPermission permission={permission.import}>
          <ImportButton
            onClick={() => {
              setOpenImport(true);
            }}
          />
        </ElementWithPermission>

        <ElementWithPermission permission={permission.export}>
          <ExportButton
            onClick={() => {
              apiService.post(apiExport).then((resp) => {
                // change data to array buffer
                const uint8Array = new Uint8Array(
                  resp?.result?.fileContents?.data
                );
                const arrayBuffer = uint8Array.buffer;

                // download the file
                Getter.downloadFile(
                  arrayBuffer,
                  'user',
                  resp?.result?.contentType
                );
              });
            }}
          />
        </ElementWithPermission>

        {showDelete && (
          <ElementWithPermission permission={permission.deleteMultiple}>
            <DeleteButton
              onClick={() => {
                deleteMultiple();
              }}
            />
          </ElementWithPermission>
        )}

        {customToolbar}
      </div>

      {openImport && (
        <ImportDrawer
          open={openImport}
          close={() => {
            setOpenImport(false);
          }}
          apiImport={apiImport}
          dumpImportData={dumpImportData}
          importColumns={importColumns}
        />
      )}
    </>
  );
}
