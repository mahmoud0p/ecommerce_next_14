import { ReactNode, FC } from "react";
import {  AnimatePresence, motion } from 'framer-motion';
import { OutSideClick } from "./outsideClick";
import { Categories } from "./categories";

type Props = {
  openDrawer: boolean;
  setOpenDrawer: (value: boolean) => void;
  children: ReactNode;
};

const Drawer: FC<Props> = ({ openDrawer, setOpenDrawer, children }) => {
  const ref = OutSideClick(() => {
    setOpenDrawer(false);
  });

  return (
      <AnimatePresence>
        {
          openDrawer && 
          <motion.aside
          ref={ref}
          className={`fixed left-0 top-0 z-10 w-3/4 sm:w-1/3 md:w-1/2 lg:w-1/4 h-full p-2 flex flex-col items-center dark:bg-zinc-900 dark:text-white bg-white shadow-2xl  rounded-l-xl  dark:shadow-black`}
          initial={{ translateX: '-100%' } }
          animate={{ translateX: 0 }}
          exit={{ translateX: '-100%'  }}
          transition={{ type: "just" }}
          >
          {children}
          <Categories/>
          </motion.aside>
        }
      </AnimatePresence>
  );
};

export default Drawer;
