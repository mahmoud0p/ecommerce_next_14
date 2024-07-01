import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { FaCheck, FaChevronDown } from "react-icons/fa";
import clsx from 'clsx';
import { useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import _ from "lodash"
interface Subcategory {
    id: string;
    name: string;
  }
  
export const SubCombo = ({ setSubcategory }: { setSubcategory: (value: string) => void  }) => {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<Subcategory >();
  
  
  
    const { data: subcategories = [], isLoading, isError } = useQuery({queryKey : ['subcategories'], queryFn: async () => {
    const response = await axios.get('/api/subcategories');
      
    return response.data;
  }});
  
    const filteredsubcategories = query === '' ? subcategories : subcategories.filter((subcategory: Subcategory) => subcategory.name.toLowerCase().includes(query.toLowerCase()));
  
    return (
      <div className=" h-auto relative w-72 ">
        <Combobox value={selected} onChange={(value: Subcategory) => { setSelected(value); setSubcategory(value?.id || ''); }} onClose={() => setQuery('')}>
          <div className="relative">
            <ComboboxInput
              placeholder='Select or type category by title..'
              className={clsx(
                'w-full rounded-lg border-none py-1.5 pr-8 pl-3 text-sm/6',
                'bg-slate-200  dark:bg-zinc-900 border dark:border-zinc-800 text-black dark:text-white',
                'focus:outline-none '
              )}
              displayValue={(subcategory: Subcategory | null) => subcategory ? subcategory.name : ''}
              onChange={(event) => setQuery(event.target.value)}
            />
            <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
              <FaChevronDown className=" size-4 text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white" />
            </ComboboxButton>
          </div>
  
          {isLoading ? (
            <div className="mt-2 p-2 text-black dark:text-white">Loading...</div>
          ) : isError ? (
            <div className="mt-2 p-2 text-red-500">Error loading subcategories</div>
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
              {filteredsubcategories.map((subcategory: Subcategory) => (
                <ComboboxOption
                  key={subcategory.id}
                  value={subcategory}
                  className={({  selected }) =>
                    clsx(
                      'group flex cursor-default hover:bg-slate-200  dark:hover:bg-mainDark items-center gap-2 rounded-lg py-1.5 px-3 select-none',
                      selected ? 'font-medium' : 'font-normal'
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <FaCheck className={clsx('size-4', selected ? 'visible' : 'invisible', 'text-black dark:text-white')} />
                      <div className="text-sm/6 text-black dark:text-white">{subcategory.name}</div>
                    </>
                  )}
                </ComboboxOption>
              ))}
              {filteredsubcategories.length === 0 && (
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
  
  