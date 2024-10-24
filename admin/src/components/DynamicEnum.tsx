import {
  SingleSelect,
  SingleSelectOption,
  MultiSelect,
  MultiSelectOption,
  Field,
} from '@strapi/design-system';
// import { Stack } from '@strapi/design-system/Stack';
import { getFetchClient /*, InputProps */ } from '@strapi/strapi/admin';
import { MouseEvent, useEffect, useState } from 'react';
import { useIntl, MessageDescriptor } from 'react-intl';
import pluginId from '../pluginId';

export type DynamicEnumOptions = {
  lookupSingleType: string;
  lookupField: string;
};

function isMessageDescriptor(message?: MessageDescriptor | string): message is MessageDescriptor {
  return (message as MessageDescriptor)?.id !== undefined;
}

export type DynamicEnumProps = {
  attribute: {
    options: DynamicEnumOptions;
  };
  description?: MessageDescriptor | string;
  placeholder?: MessageDescriptor | string;
  hint: string;
  name: string;
  label?: MessageDescriptor | string;
  onChange: (value: { target: { name: string; value?: string | string[]; type: string } }) => void;
  contentTypeUID: string;
  type: string;
  value?: string | string[];
  required?: boolean;
  error?: MessageDescriptor | string;
  disabled?: boolean;
};

export const makeDynamicEnum =
  (multiSelect: boolean): React.FunctionComponent<DynamicEnumProps> =>
  (props) => {
    const {
      value,
      onChange,
      name,
      label,
      required,
      hint,
      attribute,
      placeholder,
      disabled,
      type,
      error,
    } = props;

    const configuration = attribute.options;

    const { formatMessage } = useIntl();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [options, setOptions] = useState<string[]>([]);
    const [optionsLoadingError, setLoadingError] = useState<any | undefined>();

    const translate = (message?: MessageDescriptor | string) =>
      isMessageDescriptor(message) ? formatMessage(message) : message;

    const loadEnumOptions = async () => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const { get } = getFetchClient();
        const res = await get<{ data: { [key: string]: string | undefined } }>(
          `/content-manager/single-types/${configuration.lookupSingleType}`
        );

        if (!res.status || res.status < 400) {
          const optionsString = res.data.data[configuration.lookupField];
          if (optionsString) {
            setOptions(optionsString.match(/\S+/g) || []);
          }
        } else {
          setLoadingError(`Error, code:  ${res.status}`);
        }
      } catch (err) {
        setLoadingError((err as any)?.message || err?.toString());
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      loadEnumOptions();
    }, []);

    const handleSelectChange = (value?: string | string[]) =>
      onChange({
        target: { name, type, value },
      });

    const clear = (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      onChange({
        target: { name, type },
      });
    };

    const selectOptionsList = options.map((opt) => {
      return multiSelect ? (
        <MultiSelectOption value={opt} key={opt}>
          {opt}
        </MultiSelectOption>
      ) : (
        <SingleSelectOption value={opt} key={opt}>
          {opt}
        </SingleSelectOption>
      );
    });

    return (
      <Field.Root
        name={name}
        id={name}
        hint={translate(hint)}
        error={translate(error || optionsLoadingError)}
        required={required}
      >
        <Field.Label>{translate(label)}</Field.Label>
        {multiSelect ? (
          <MultiSelect
            placeholder={translate(placeholder)}
            name={name}
            onChange={(value: string[]) => handleSelectChange(value)}
            value={value as string[]}
            disabled={disabled}
            required={required}
            onClear={clear}
            withTags
          >
            {selectOptionsList}
          </MultiSelect>
        ) : (
          <SingleSelect
            placeholder={translate(placeholder)}
            name={name}
            onChange={(value: string | number) => handleSelectChange(`${value}`)}
            value={value as string}
            disabled={disabled}
            required={required}
            onClear={clear}
          >
            {selectOptionsList}
          </SingleSelect>
        )}
        <Field.Hint />
        <Field.Error />
      </Field.Root>
    );
  };

export default makeDynamicEnum;
