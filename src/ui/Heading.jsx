import { cva } from "class-variance-authority";
import { cn } from "@shared/utils/utils";

const textVariants = cva(
    'text-light-text dark:text-dark-text',
    {
        variants: {
            size: {
                sm: 'text-sm',
                md: 'text-md',
                lg: 'text-lg',
                xl: 'text-xl',
                '2xl': 'text-2xl',
                '5xl': 'text-5xl',
            },
            variant: {
                heading: 'mb-2',
                subheading: '',
            },
            fontWeight: {
                thin: 'font-thin',
                normal: 'font-normal',
                bold: 'font-bold',
                light: 'font-light',
            },
            margin: {
                none: '',
                mb2: 'mb-2',
                mb4: 'mb-4',
                mb8: 'mb-8',
            },
            padding:{
                none: '',
                px6: 'px-6',
                px1: 'px-12',
            }
        },
        defaultVariants: {
            variant: 'heading',
            size: 'xl',
            fontWeight: 'thin',
            margin: "mb2",
        }
    }
);

export default function Heading({
    as: Component = "p",
    className,
    size,
    fontWeight,
    padding,
    margin,
    variant,
    decoratedText,
    children,
    ...props
}) {
   return <Component {...props} className={cn(textVariants({size, fontWeight, margin, padding,variant, className}))} >
      {children}
   </Component>
}