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

interface CustomMenuProps extends MenuProps<any> {}

const CustomMenu: React.FC<CustomMenuProps> = p => {
  const { Menu } = components;
  const { children, ...rest } = p;
  return <Menu {...rest}>{children}</Menu>;
};

interface SingleSelectCellProps {
  readonly kind: "single-select";
  readonly value: string;
  readonly allowedValues: readonly string[];
  readonly readonly?: boolean;
}

export type SingleSelectCell = CustomCell<SingleSelectCellProps>;

let metricsSize = 0;
let metricsCache: Record<string, TextMetrics | undefined> = {};
function makeCacheKey(s: string, ctx: CanvasRenderingContext2D, baseline: "alphabetic" | "middle", font?: string) {
    return `${s}_${font ?? ctx.font}_${baseline}`;
}
export function measureTextCached(s: string, ctx: CanvasRenderingContext2D, font?: string): TextMetrics {
  const key = makeCacheKey(s, ctx, "middle", font);
  let metrics = metricsCache[key];
  if (metrics === undefined) {
      metrics = ctx.measureText(s);
      metricsCache[key] = metrics;
      metricsSize++;
  }

  if (metricsSize > 10_000) {
      metricsCache = {};
      metricsSize = 0;
  }

  return metrics;
}

interface CornerRadius {
  tl: number;
  tr: number;
  bl: number;
  br: number;
}


export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | CornerRadius
) {
  if (typeof radius === "number") {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
  }

  radius = {
      tl: Math.min(radius.tl, height / 2, width / 2),
      tr: Math.min(radius.tr, height / 2, width / 2),
      bl: Math.min(radius.bl, height / 2, width / 2),
      br: Math.min(radius.br, height / 2, width / 2),
  };

  ctx.moveTo(x + radius.tl, y);
  ctx.arcTo(x + width, y, x + width, y + radius.tr, radius.tr);
  ctx.arcTo(x + width, y + height, x + width - radius.br, y + height, radius.br);
  ctx.arcTo(x, y + height, x, y + height - radius.bl, radius.bl);
  ctx.arcTo(x, y, x + radius.tl, y, radius.tl);
}

const Editor: ReturnType<ProvideEditorCallback<SingleSelectCell>> = p => {
  // @ts-ignore
  const { value: cell, onFinishedEditing, initialValue } = p;
  const { allowedValues, value: valueIn } = cell.data;

  // @ts-ignore
  const [value, setValue] = React.useState(valueIn);
  // console.log(initialValue);
  const [inputValue, setInputValue] = React.useState(initialValue ?? "");

  console.log(inputValue, setInputValue)

  const values = React.useMemo(
    () =>
        allowedValues.map(x => ({
            value: x,
            label: x,
        })),
    [allowedValues]
  );


  // @ts-ignore
  const theme = useTheme();

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
      cacheOptions
      loadOptions={loadOptions}
      defaultOptions
      menuPortalTarget={document.getElementById("portal")}
      value={values.find(x => x.value === value)}
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
          console.log(e, '====e')
          setValue(e.value);
          await new Promise(r => window.requestAnimationFrame(r));
          onFinishedEditing({
              ...cell,
              data: {
                  ...cell.data,
                  value: e.value,
              },
          });
      }}
    />
    // <AsyncSelect
    //   inputValue={inputValue}
    //   onInputChange={async (value) => {
    //     setInputValue(value);
    //     await searchOptionList(value);
    //   }}
    // />
  );
};

const SingleSelect: CustomRenderer<SingleSelectCell> = {
  kind: GridCellKind.Custom,
  isMatch: (c): c is SingleSelectCell => (c.data as any).kind === "single-select",
  draw: (args, cell) => {
      const { rect, theme, ctx } = args;
      const { x, y, width: w, height: h } = rect;
      const bubbleHeight = 20;
      const bubblePad = 8;
      let renderX = x + theme.cellHorizontalPadding;

      const renderBoxes: { x: number; width: number }[] = [];
      for (const s of [cell.data.value]) {
          if (renderX > x + w) break;
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

          renderX += textWidth + bubblePad * 2;
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
        console.log(i)
          ctx.beginPath();
          ctx.fillStyle = theme.textBubble;
          if (cell.data.value.length > 6) {
            ctx.fillText(`${cell.data.value.substring(0,4)}...`, rectInfo.x + bubblePad, y + h / 2 + getMiddleCenterBias(ctx, theme));
          } else {
            ctx.fillText(cell.data.value, rectInfo.x + bubblePad, y + h / 2 + getMiddleCenterBias(ctx, theme));
          }
      }

      return true;
  },
  provideEditor: () => ({
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
  }),
  onPaste: (v, d) => ({
      ...d,
      value: d.allowedValues.includes(v) ? v : d.value,
  }),
};

export default SingleSelect;
