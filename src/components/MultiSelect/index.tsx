import React, { useCallback } from 'react';
import {
  CustomCell,
  ProvideEditorCallback,
  CustomRenderer,
  getMiddleCenterBias,
  GridCellKind,
  useTheme,
} from "@glideapps/glide-data-grid";
import { MenuProps, components } from "react-select";
import AsyncSelect from 'react-select/async';
import { measureTextCached, roundedRect } from '../SingleSelect';

interface CustomMenuProps extends MenuProps<any> {}

export interface ColourOption {
  value: string;
  label: string;
  color?: string;
  isFixed?: boolean;
  isDisabled?: boolean;
}

const CustomMenu: React.FC<CustomMenuProps> = p => {
  const { Menu } = components;
  const { children, ...rest } = p;
  return <Menu {...rest}>{children}</Menu>;
};

interface MultiSelectCellProps {
 kind: "multi-select";
 value: string;
 allowedValues: string[];
 readonly?: boolean;
}

export type MultiSelectCell = CustomCell<MultiSelectCellProps>;

const Editor: ReturnType<ProvideEditorCallback<MultiSelectCell>> = p => {
  const { value: cell, onFinishedEditing, initialValue } = p;
  const { allowedValues, value: valueIn } = cell.data;


  const [value, setValue] = React.useState(valueIn?.split(',').map(v => ({ label: v, value: v })));

  console.log(value)

  // @ts-ignore
  const [inputValue, setInputValue] = React.useState(initialValue ?? "");

  // @ts-ignore
  const theme = useTheme();

  const values = React.useMemo(
      () =>
          allowedValues.map(x => ({
              value: x,
              label: x,
          })),
      [allowedValues]
  );

  const filterOptions = useCallback((inputValue: string) => {
    return values.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [values]);

  const loadOptions = useCallback((
    inputValue: string,
    callback: (options: any[]) => void
  ) => {
    console.log(inputValue, '===inputvalue');
    setTimeout(() => {
      if (inputValue) {
        callback(values.filter(item => item.label.includes(inputValue)));
      } else {
        callback(values);
      }
    }, 1000);
  }, [filterOptions]);

  return (
    <AsyncSelect
      isMulti
      cacheOptions
      loadOptions={loadOptions}
      defaultOptions
      menuPortalTarget={document.getElementById("portal")}
      value={values.filter(x => value.find(i => i.value === x.value))}
      menuPlacement={"auto"}
      isSearchable
      autoFocus={true}
      openMenuOnFocus={true}
      components={{
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null,
          Menu: props => {
            console.log(props, '===props')
            return (
              
              <CustomMenu className={"click-outside-ignore"} {...props} />
      )
          },
      }}
      styles={{
          control: base => ({
              ...base,
              border: 0,
              boxShadow: "none",
          }),
          // singleValue: (styles, { data }) => ({ ...styles, ...dot(data.color) }),
      }}
      onChange={async e => {
          if (e === null) return;
          console.log(e, '====e');
          // @ts-ignore
          setValue(e);
          await new Promise(r => window.requestAnimationFrame(r));
          console.log(e.map(v => v.value).join(','), '===e.map(v => v.value).join')
          onFinishedEditing({
              ...cell,
              copyData: `${e.map(v => v.value).join(',').replace(/"/g, '""')}`,
              data: {
                  ...cell.data,
                  // @ts-ignore
                  value: e.map(v => v.value).join(','),
                  // copyData: e.map(v => v.value).join(','),
              },
          });
      }}
    />
    // <Select
    //   className="glide-select"
    //   isMulti
    //   inputValue={inputValue}
    //   onInputChange={async value => {
    //     setInputValue(value)
    //     await searchOptionList();
    //   }}
    //   isSearchable
    //   menuPlacement={"auto"}
    //   value={values.filter(x => value.includes(x.value))}
    //   styles={{
    //       control: base => ({
    //           ...base,
    //           border: 0,
    //           boxShadow: "none",
    //       }),
    //   }}
    //   theme={t => {
    //       return {
    //           ...t,
    //           colors: {
    //               ...t.colors,
    //               neutral0: theme.bgCell, // this is both the background color AND the fg color of
    //               // the selected item because of course it is.
    //               neutral5: theme.bgCell,
    //               neutral10: theme.bgCell,
    //               neutral20: theme.bgCellMedium,
    //               neutral30: theme.bgCellMedium,
    //               neutral40: theme.bgCellMedium,
    //               neutral50: theme.textLight,
    //               neutral60: theme.textMedium,
    //               neutral70: theme.textMedium,
    //               neutral80: theme.textDark,
    //               neutral90: theme.textDark,
    //               neutral100: theme.textDark,
    //               primary: theme.accentColor,
    //               primary75: theme.accentColor,
    //               primary50: theme.accentColor,
    //               primary25: theme.accentLight, // prelight color
    //           },
    //       };
    //   }}
    //   menuPortalTarget={document.getElementById("portal")}
    //   autoFocus={true}
    //   openMenuOnFocus={true}
    //   components={{MultiValueContainer}}
    //   options={values}
    //   onChange={async e => {
    //       if (e === null) return;
    //       console.log(e, '===e')
    //       setValue(e?.map(item => item?.value)?.toString());
    //       await new Promise(r => window.requestAnimationFrame(r));
    //       onFinishedEditing({
    //           ...cell,
    //           data: {
    //               ...cell.data,
    //               value: e?.map(item => item?.value)?.toString(),
    //           },
    //       });
    //   }}
    // />
  );
};

const MultiSelect: CustomRenderer<MultiSelectCell> = {
  kind: GridCellKind.Custom,
  isMatch: (c): c is MultiSelectCell => (c.data as any).kind === "multi-select",
  draw: (args, cell) => {
      const { rect, theme, ctx } = args;
      const { x, y, width: w, height: h } = rect;
      const bubbleHeight = 20;
      const bubblePad = 8;
      let renderX = x + theme.cellHorizontalPadding;

      const renderBoxes: { x: number; width: number }[] = [];
      const num = Math.floor((w - theme.cellHorizontalPadding - 30) / 63);
      let flag = false;
      console.log(cell.data.value, '===value')
      for (const s of cell.data.value?.split(',')) {
        if (!flag) {
          if (renderBoxes.length >= num) {
            let textWidth = measureTextCached(`+${cell.data.value?.split(',').length - num}`, ctx, `${theme.baseFontStyle} ${theme.fontFamily}`).width;
            renderBoxes.push({
                x: renderX,
                width: textWidth,
            });
  
            renderX += textWidth + bubblePad * 2 + 6;
            flag = true;
          } else {
  
            let textWidth;
            if (s.length > 6) {
              textWidth = measureTextCached(`${s.substring(0,4)}...`, ctx, `${theme.baseFontStyle} ${theme.fontFamily}`).width;
            } else {
              textWidth = measureTextCached(s, ctx, `${theme.baseFontStyle} ${theme.fontFamily}`).width;
            }
            renderBoxes.push({
                x: renderX,
                width: textWidth,
            });
  
            renderX += textWidth + bubblePad * 2 + 6;
          }
        }
      }

      ctx.beginPath();
      for (const rectInfo of renderBoxes) {
          roundedRect(
              ctx,
              rectInfo.x,
              y + (h - bubbleHeight) / 2,
              rectInfo.width + bubblePad * 2,
              bubbleHeight,
              2
          );
      }
      ctx.fillStyle = '#e5e5e5';
      ctx.fill();

      for (const [i, rectInfo] of renderBoxes.entries()) {
          ctx.beginPath();
          ctx.fillStyle = theme.textBubble;
          if (i >= num) {ctx.fillText(`+${cell.data.value?.split(',').length - num}`, rectInfo.x + bubblePad, y + h / 2 + getMiddleCenterBias(ctx, theme));

          } else {
            if (cell.data.value?.split(',')?.[i].length > 6) {
              ctx.fillText(`${cell.data.value?.split(',')?.[i].substring(0,4)}...`, rectInfo.x + bubblePad, y + h / 2 + getMiddleCenterBias(ctx, theme));
            } else {
              ctx.fillText(cell.data.value?.split(',')?.[i], rectInfo.x + bubblePad, y + h / 2 + getMiddleCenterBias(ctx, theme));
            }
          }
      }


      return true;
  },
  // @ts-ignore
  provideEditor: () => {
    // console.log(v, '====v', d, '====d')
    return ({
      editor: Editor,
      disablePadding: true,
      deletedValue: v => ({
          ...v,
          copyData: "",
          data: {
              ...v.data,
              value: "",
          },
      }),
  })
  },
  onPaste: (v, d) => {
    // @ts-ignore
    const str = v?.replaceAll('"', '');
    console.log(str, '===st')
    const arr = str.split(',');
    return ({
      ...d,
      // @ts-ignore
      value: arr.every(item => d.allowedValues.includes(item)) ? str : d.value,
  })
  },
};

export default MultiSelect;
