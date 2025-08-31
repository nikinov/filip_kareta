import { Info, AlertTriangle, CheckCircle, XCircle, Lightbulb, MapPin } from 'lucide-react';

interface CalloutBoxProps {
  children: React.ReactNode;
  type?: 'info' | 'warning' | 'success' | 'error' | 'tip' | 'local-tip';
  title?: string;
  icon?: React.ReactNode;
}

export function CalloutBox({ 
  children, 
  type = 'info', 
  title, 
  icon 
}: CalloutBoxProps) {
  const configs = {
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      titleColor: 'text-blue-800',
      icon: <Info className="w-5 h-5" />,
      defaultTitle: 'Information',
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-900',
      titleColor: 'text-yellow-800',
      icon: <AlertTriangle className="w-5 h-5" />,
      defaultTitle: 'Warning',
    },
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      titleColor: 'text-green-800',
      icon: <CheckCircle className="w-5 h-5" />,
      defaultTitle: 'Success',
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      titleColor: 'text-red-800',
      icon: <XCircle className="w-5 h-5" />,
      defaultTitle: 'Error',
    },
    tip: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      titleColor: 'text-green-800',
      icon: <Lightbulb className="w-5 h-5" />,
      defaultTitle: 'Pro Tip',
    },
    'local-tip': {
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-900',
      titleColor: 'text-purple-800',
      icon: <MapPin className="w-5 h-5" />,
      defaultTitle: 'Local Tip',
    },
  };

  const config = configs[type];
  const displayIcon = icon || config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <div className={`border-l-4 ${config.borderColor} ${config.bgColor} p-6 my-6 rounded-r-lg`}>
      <div className="flex items-start gap-3">
        <div className={`${config.titleColor} flex-shrink-0 mt-0.5`}>
          {displayIcon}
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold ${config.titleColor} mb-2`}>
            {displayTitle}
          </h4>
          <div className={`${config.textColor} prose prose-sm max-w-none`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}