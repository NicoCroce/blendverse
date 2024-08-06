import { Variant, motion } from 'framer-motion';

type Props = {
  children: React.ReactNode;
};

type TVariants = {
  hidden: Variant;
  enter: Variant;
  exit: Variant;
};

// I want a fade in bottom-up - fade out top-down animation
// so these are my variants
const variants: TVariants = {
  hidden: { opacity: 0.3, translateY: 5, scale: 0.96 },
  enter: { opacity: 1, translateY: 0, scale: 1 },
  exit: { opacity: 0.3, translateY: 5, scale: 0.96 },
};

const AnimatedLayout = ({ children }: Props): React.JSX.Element => {
  return <>{children}</>;
  return (
    <motion.div
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.2, type: 'tween' }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedLayout;
