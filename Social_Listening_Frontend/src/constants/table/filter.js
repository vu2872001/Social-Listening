const numberType = [
  'Is Equal To',
  'Is Not Equal To',
  'Is Greater Than Or Equal To',
  'Is Greater Than',
  'Is Less Than Or Equal To',
  'Is Less Than',
];

const dateTimeType = [
  'Is Equal To',
  'Is Before Or Equal To',
  'Is Before',
  'Is After Or Equal To',
  'Is After',
  'Between'
];

const defaultType = ['Contains', 'Does Not Contains'];

const equalType = ['Is Equal To', 'Is Not Equal To'];

export const FilterType = {
  Number: numberType,
  DateTime: dateTimeType,
  Default: defaultType,
  Dropdown: equalType,
  Boolean: equalType,
};
