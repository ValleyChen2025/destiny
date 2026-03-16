'use client';

import { useLanguage } from '@/components/LanguageContext';

export default function AboutPage() {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';

  const advantages = [
    {
      icon: '📚',
      title: isZh ? '10年+命理经验' : '10+ Years Experience',
      desc: isZh ? '资深命理师团队，专业可靠' : 'Professional Bazi masters with years of experience'
    },
    {
      icon: '🎯',
      title: isZh ? '个性化命盘解析' : 'Personalized Analysis',
      desc: isZh ? '针对个人特点定制分析报告' : 'Customized reports based on your unique Bazi'
    },
    {
      icon: '🔒',
      title: isZh ? '隐私加密保护' : 'Privacy Protection',
      desc: isZh ? '严格保密您的个人信息' : 'Your personal information is strictly confidential'
    }
  ];

  const steps = [
    { num: '1', title: isZh ? '提交询价' : 'Submit Inquiry' },
    { num: '2', title: isZh ? '确认需求' : 'Confirm Details' },
    { num: '3', title: isZh ? '深度解析' : 'Deep Analysis' },
    { num: '4', title: isZh ? '交付报告' : 'Deliver Report' }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-4">
        {isZh ? '关于我们' : 'About Us'}
      </h1>

      <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-12">
        {isZh
          ? '用传统智慧解读现代人生'
          : 'Interpreting modern life with traditional wisdom'}
      </p>

      {/* Advantages */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {advantages.map((item, i) => (
          <div key={i} className="text-center p-6 bg-gray-50 dark:bg-zinc-800 rounded-xl">
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="font-bold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Process */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-center mb-8">
          {isZh ? '服务流程' : 'Service Process'}
        </h2>
        <div className="flex justify-between items-center">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-2">
                {step.num}
              </div>
              <span className="text-sm text-center">{step.title}</span>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute w-full h-0.5 bg-gray-200 -z-10" style={{ left: '50%', width: '100%', top: '24px' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-4">🔒 {isZh ? '隐私声明' : 'Privacy Policy'}</h2>
        <p className="text-gray-600 dark:text-gray-300">
          {isZh
            ? '所有提交的八字信息仅用于分析，我们将严格保密，绝不泄露给任何第三方。'
            : 'All Bazi information submitted is only used for analysis. We will keep it strictly confidential and never share with any third party.'}
        </p>
      </div>
    </div>
  );
}
