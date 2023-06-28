const numberType = [
  'Is Greater Than Or Equal To',
  'Is Greater Than',
  'Is Less Than Or Equal To',
  'Is Less Than',
  'Is Equal To',
  'Is Not Equal To',
];

const textType = ['Start With', 'End With'];

const dateTimeType = [
  'Is Equal To',
  'Is Before Or Equal To',
  'Is Before',
  'Is After Or Equal To',
  'Is After',
  'Between',
];

const defaultType = [
  'Contains',
  'Does Not Contains',
  'Is Empty',
  'Is Not Empty',
];

export const FilterType = {
  Number: numberType,
  Text: textType,
  DateTime: dateTimeType,
  Default: defaultType,
};
