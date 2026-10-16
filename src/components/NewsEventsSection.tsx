import React, { useState } from 'react';
import { Calendar, Tag, ArrowRight } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  category: 'Announcements' | 'Academic' | 'Examinations' | 'Events' | 'Achievements';
  date: string;
  excerpt: string;
  imageUrl: string;
}

export const NewsEventsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const newsItems: NewsItem[] = [
    {
      id: 'news-1',
      title: 'Form One 2026 Admissions & Student Transfers Open',
      category: 'Announcements',
      date: 'August 28, 2025',
      excerpt: 'Uomboni Secondary School announces openings for Form One entry and selective Form 2 & 3 transfers for day and boarding students.',
      imageUrl: '/media/media_6.webp',
    },
    {
      id: 'news-2',
      title: 'Intensive Academic Revision Camp for Form Four Candidates',
      category: 'Examinations',
      date: 'August 20, 2025',
      excerpt: 'Form 4 students commence their dedicated subject preparation and mock examinations ahead of the national CSEE assessment series.',
      imageUrl: '/media/media_7.webp',
    },
    {
      id: 'news-3',
      title: 'Practical Digital Skills & ICT Laboratory Commissioned',
      category: 'Academic',
      date: 'August 14, 2025',
      excerpt: 'Modern computer workstations and structured digital literacy classes installed to support scientific research and STEM learning.',
      imageUrl: '/media/media_8.jpg',
    },
    {
      id: 'news-4',
      title: 'Solemn Thanksgiving Eucharistic Celebration & Spiritual Guidance',
      category: 'Events',
      date: 'August 08, 2025',
      excerpt: 'Campus community gathers for prayer, thanksgiving, and moral reflection under the theme of Prayer, Education, and Diligent Work.',
      imageUrl: '/media/media_9.jpg',
    },
    {
      id: 'news-5',
      title: 'Uomboni Sports Teams Victorious at UMISETA Athletics Circuit',
      category: 'Achievements',
      date: 'August 01, 2025',
      excerpt: 'Student athletes excel in regional track and football tournaments, demonstrating high physical discipline and school camaraderie.',
      imageUrl: '/media/media_10.jpg',
    },
    {
      id: 'news-6',
      title: 'Annual Parents-Teachers Association (PTA) Conference',
      category: 'Announcements',
      date: 'July 25, 2025',
      excerpt: 'School Board and parents review ongoing infrastructure improvements, boarding dining facilities, and academic strategies.',
      imageUrl: '/media/media_11.webp',
    },
  ];

  const categories = ['All', 'Announcements', 'Academic', 'Examinations', 'Events', 'Achievements'];

  const filteredItems = selectedCategory === 'All'
    ? newsItems
    : newsItems.filter(item => item.category === selectedCategory);

  return (
    <section id="news" className="py-20 sm:py-24 bg-[#FFFFF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold text-[#C9A227] tracking-wider block mb-2 uppercase">
              Updates &amp; Highlights
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight leading-[1.2]">
              News &amp; Events
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-700 leading-[1.75] font-normal">
              Stay informed with official school announcements, academic milestones, examinations schedules, and student achievements at Uomboni Secondary School.
            </p>
          </div>

          {/* Clean Segmented Filter Controls */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-md border border-slate-200">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#102A43] text-white font-semibold'
                    : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-lg border border-[#102A43]/10 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              <div>
                {/* Real Image */}
                <div className="aspect-16/10 overflow-hidden bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Clean unboxed metadata with typographic separator */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-[#C9A227]">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.date}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#102A43] leading-snug group-hover:text-[#102A43]/85 transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-0">
                <span className="text-xs font-semibold text-[#102A43] group-hover:text-[#C9A227] inline-flex items-center gap-1 transition-colors">
                  Read Announcement
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
