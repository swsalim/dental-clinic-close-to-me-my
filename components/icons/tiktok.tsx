import { type SVGProps } from 'react';

interface TikTokProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

const TikTok = ({ className, ...props }: TikTokProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="800px"
      height="800px"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}>
      <path
        xmlns="http://www.w3.org/2000/svg"
        id="primary"
        d="M21,7H20a4,4,0,0,1-4-4H12V14.5a2.5,2.5,0,1,1-4-2V8.18a6.5,6.5,0,1,0,8,6.32V9.92A8,8,0,0,0,20,11h1Z"
        style={{
          fill: 'none',
          stroke: 'currentColor',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: '2',
        }}
      />
    </svg>
  );
};

export default TikTok;
