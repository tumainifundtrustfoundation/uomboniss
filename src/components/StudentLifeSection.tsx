import React from 'react';

interface StudentLifeSectionProps {
  onNavigate?: (sectionId: string) => void;
  onOpenAdmissions?: () => void;
}

export const StudentLifeSection: React.FC<StudentLifeSectionProps> = ({
  onNavigate,
  onOpenAdmissions,
}) => {
  const studentLifeAreas = [
    {
      title: 'Academic Activities',
      description: 'Daily structured classroom lessons, supervised evening prep, interactive subject symposiums, and inter-class academic quizzes.',
      image: '/media/media_15.jpg',
      category: 'Academics',
    },
    {
      title: 'Laboratories & Practical Science',
      description: 'Dedicated Physics, Chemistry, and Biology laboratories equipped for practical NECTA examination preparation and scientific inquiry.',
      image: '/media/media_13.jpg',
      category: 'Science',
    },
    {
      title: 'Sports & Athletics',
      description: 'Football, netball, volleyball, track athletics, and inter-school UMISETA competitions promoting physical health and team spirit.',
      image: '/media/media_16.jpg',
      category: 'Athletics',
    },
    {
      title: 'ICT & Computer Studies',
      description: 'Modern computer lab with structured digital skills training, computer basics, educational research, and typing fluency.',
      image: '/media/media_8.jpg',
      category: 'Technology',
    },
    {
      title: 'School Events & Liturgy',
      description: 'Thanksgiving Masses, academic awards ceremonies, cultural bonanzas, debate tournaments, and community service days.',
      image: '/media/media_12.jpg',
      category: 'Community',
    },
    {
      title: 'Library & Research',
      description: 'Quiet study library stocked with curriculum textbooks, reference guides, past national exam papers, and general knowledge volumes.',
      image: '/media/media_7.webp',
      category: 'Knowledge',
    },
    {
      title: 'Clubs & Societies',
      description: 'Debate Club, Young Catholic Students (YCS/TYCS), Environmental & Tree Planting Club, Red Cross First Aid, and Science Innovators.',
      image: '/media/media_10.jpg',
      category: 'Co-Curricular',
    },
    {
      title: 'Student Leadership',
      description: 'Democratic Prefects Council, dormitory captains, and class monitors developing ethical responsibility, discipline, and peer guidance.',
      image: '/media/media_11.webp',
      category: 'Leadership',
    },
  ];

  return (
    <section id="students" className="py-20 sm:py-24 bg-[#FFFFF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-semibold text-[#C9A227] tracking-wider block mb-2 uppercase">
            Campus Experience
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight leading-[1.2]">
            Student Life
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-700 leading-[1.75] font-normal">
            Education at Uomboni Secondary School extends beyond the chalkboard. We nurture well-rounded, disciplined, and purposeful young men and women through a balanced blend of academic, co-curricular, and moral activities.
          </p>
        </div>

        {/* 8 Areas Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentLifeAreas.map((area) => (
            <div
              key={area.title}
              className="bg-white rounded-lg border border-[#102A43]/10 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              {/* Authentic Photo */}
              <div className="aspect-4/3 overflow-hidden bg-slate-100 relative">
                <img
                  src={area.image}
                  alt={area.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-2.5 left-2.5 bg-[#102A43]/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-sm">
                  {area.category}
                </span>
              </div>

              {/* Text content */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#102A43]">
                    {area.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-[1.7] font-normal">
                    {area.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Boarding & Day summary box */}
        <div className="mt-12 p-6 rounded-lg bg-white border border-[#102A43]/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-[#102A43]">
              Boarding &amp; Day Facilities
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-[1.7] font-normal">
              Safe, secure, and clean dormitories with supervised study schedules, balanced nutritious dining, clean mountain water, and dedicated on-campus health care.
            </p>
          </div>

          {onOpenAdmissions && (
            <button
              onClick={onOpenAdmissions}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#102A43] hover:bg-[#0A1C2E] rounded-md transition-colors cursor-pointer shrink-0"
            >
              Learn About Admissions
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
