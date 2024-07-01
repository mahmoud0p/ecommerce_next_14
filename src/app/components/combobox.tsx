import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { FaCheck, FaChevronDown } from "react-icons/fa";
import clsx from 'clsx';
import { useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import _ from "lodash"
interface Category {
  id: string;
  name: string;
}


export const CustomCombobox = ({ setCategory }: { setCategory: (value: string) => void  }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Category >();



  const { data: categories = [], isLoading, isError } = useQuery({queryKey : ['categories'], queryFn: async () => {
  const response = await axios.get('/api/categories');
    
  return response.data;
}});

  const filteredCategories = query === '' ? categories : categories.filter((category: Category) => category.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className=" h-auto relative w-72 pt-5">
      <Combobox value={selected} onChange={(value: Category) => { setSelected(value); setCategory(value?.id || ''); }} onClose={() => setQuery('')}>
        <div className="relative">
          <ComboboxInput
            placeholder='Select or type category by title..'
            className={clsx(
              'w-full rounded-lg border-none py-1.5 pr-8 pl-3 text-sm/6',
              'bg-white dark:bg-mainDark border dark:border-zinc-800 text-black dark:text-white',
              'focus:outline-none '
            )}
            displayValue={(category: Category | null) => category ? category.name : ''}
            onChange={(event) => setQuery(event.target.value)}
          />
          <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
            <FaChevronDown className=" size-4 text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white" />
          </ComboboxButton>
        </div>

        {isLoading ? (
          <div className="mt-2 p-2 text-black dark:text-white">Loading...</div>
        ) : isError ? (
          <div className="mt-2 p-2 text-red-500">Error loading categories</div>
        ) : (
          <ComboboxOptions
            anchor="bottom"
            transition
            className={clsx(
              'w-72 rounded-xl z-[1600] border p-1',
              'border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900',
              'transition duration-100 ease-in opacity-100'
            )}
          >
            {filteredCategories.map((category: Category) => (
              <ComboboxOption
                key={category.id}
                value={category}
                className={({  selected }) =>
                  clsx(
                    'group flex cursor-default hover:bg-mainDark items-center gap-2 rounded-lg py-1.5 px-3 select-none',
                    selected ? 'font-medium' : 'font-normal'
                  )
                }
              >
                {({ selected }) => (
                  <>
                    <FaCheck className={clsx('size-4', selected ? 'visible' : 'invisible', 'text-black dark:text-white')} />
                    <div className="text-sm/6 text-black dark:text-white">{category.name}</div>
                  </>
                )}
              </ComboboxOption>
            ))}
            {filteredCategories.length === 0 && (
              <div className="cursor-default select-none relative py-2 px-4 text-black dark:text-white">
                No options, enter to add <strong>{query}</strong>
              </div>
            )}
          </ComboboxOptions>
        )}
      </Combobox>
    </div>
  );
};
