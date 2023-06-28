import { useState, createContext, useContext, useRef } from 'react';
import { getSettingByKeyAndGroup } from '../../../screens/private/setting/settingService';
import useEffectOnce from '../../hooks/useEffectOnce';

export const DialogflowContext = createContext();

const DialogflowProvider = ({ children }) => {
  const [dialogflowConfig, setDialogflowConfig] = useState(null);
  const key = useRef(null);
  const location = useRef('global');

  useEffectOnce(() => {
    Promise.all([
      getSettingByKeyAndGroup({
        key: 'DIALOGFLOW_KEY',
        group: 'GOOGLE_API',
      }),
      getSettingByKeyAndGroup({
        key: 'DIALOGFLOW_LOCATION',
        group: 'GOOGLE_API',
      }),
    ]).then(([keyResp, locationResp]) => {
      key.current = keyResp?.value;
      location.current = locationResp?.value ?? 'global';
      setDialogflowConfig(
        `projects/${key.current}/locations/${location.current}`
      );
    });
  });

  const updateDialogflowConfig = (key, location = 'global') => {
    setDialogflowConfig(`projects/${key}/locations/${location}`);
  };

  return (
    <DialogflowContext.Provider
      value={{ dialogflowConfig, updateDialogflowConfig }}
    >
      {children}
    </DialogflowContext.Provider>
  );
};

export const useDialogflow = () => useContext(DialogflowContext);

export default DialogflowProvider;
