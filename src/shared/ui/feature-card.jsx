import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './card';

export function FeatureCard({
  title,
  description,
  imageSrc,
  onClick,
  className,
}) {
  return (
    <Card
      className={`group relative w-full max-w-[320px] bg-white cursor-pointer ${className} p-1`}
      onClick={onClick}
    >
      {/* Image Section */}
      <CardHeader className="p-0">
        <div className="aspect-[16/9] overflow-hidden rounded-t-lg ">
          <img
            src={imageSrc}
            alt={title}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <CardTitle className="mb-2 text-lg font-medium">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
