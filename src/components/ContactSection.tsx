import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
      setFormSubmitted(false);
    }, 6000);
  };

  return (
    <section id="contact" className="py-12 sm:py-16 bg-[#FFFFF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold text-[#C9A227] tracking-wider block mb-2 uppercase">
            Get In Touch
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight leading-[1.2]">
            Contact Uomboni Secondary School
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-700 leading-[1.75] font-normal">
            We welcome inquiries from prospective parents, alumni, and educational partners. Reach out to our administrative team or visit our school offices in Marangu.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-7 rounded-lg border border-[#102A43]/15 shadow-xs space-y-6">
              <h3 className="text-base font-semibold text-[#102A43]">
                Official School Contacts
              </h3>

              {/* Physical Location */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-md bg-[#FFFFF0] border border-[#C9A227]/40 flex items-center justify-center text-[#102A43] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-[#102A43]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#102A43] block">Physical Address</span>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                    Marangu West, Moshi Rural District<br />
                    Mount Kilimanjaro Slopes, Kilimanjaro Region<br />
                    P.O. Box 361, Marangu - Moshi, Tanzania
                  </p>
                </div>
              </div>

              {/* Telephone */}
              <div className="flex items-start gap-3.5 pt-4 border-t border-slate-100">
                <div className="w-9 h-9 rounded-md bg-[#FFFFF0] border border-[#C9A227]/40 flex items-center justify-center text-[#102A43] shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-[#102A43]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#102A43] block">Telephone Hotlines</span>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 space-y-1 font-mono font-medium">
                    <span className="block">+255 752 000 939 (Admissions Desk)</span>
                    <span className="block">+255 782 558 127 (Headmaster)</span>
                    <span className="block">+255 754 532 949 (Second Master)</span>
                    <span className="block">+255 745 548 225 (Academic Master)</span>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5 pt-4 border-t border-slate-100">
                <div className="w-9 h-9 rounded-md bg-[#FFFFF0] border border-[#C9A227]/40 flex items-center justify-center text-[#102A43] shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-[#102A43]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#102A43] block">Official Email &amp; Web</span>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    info@uomboniss.ac.tz<br />
                    uombonisec@gmail.com<br />
                    <span className="font-mono text-xs text-[#102A43] font-semibold">www.uomboniss.ac.tz</span>
                  </p>
                </div>
              </div>

              {/* Office Hours */}
              <div className="flex items-start gap-3.5 pt-4 border-t border-slate-100">
                <div className="w-9 h-9 rounded-md bg-[#FFFFF0] border border-[#C9A227]/40 flex items-center justify-center text-[#102A43] shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-[#102A43]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#102A43] block">Administrative Office Hours</span>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Monday – Friday: 8:00 AM – 4:30 PM<br />
                    Saturday: 9:00 AM – 1:00 PM (By Appointment)<br />
                    Sunday: Closed for Worship &amp; Rest
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#102A43]/15 shadow-xs">
              <h3 className="text-base font-bold text-[#102A43] uppercase tracking-wider mb-2">
                Send an Inquiry
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Our admissions and academic registry team typically responds within one business day.
              </p>

              {formSubmitted ? (
                <div className="p-6 bg-[#FFFFF0] border border-[#C9A227]/40 rounded-lg text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#102A43] mx-auto" />
                  <h4 className="text-sm font-bold text-[#102A43]">
                    Inquiry Received Successfully
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Thank you for contacting Uomboni Secondary School. An administrative officer will review your message and reach out shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#102A43] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. John K. Mushi"
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-[#102A43] bg-white text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#102A43] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+255 7XX XXX XXX"
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-[#102A43] bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#102A43] mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-[#102A43] bg-white text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#102A43] mb-1">
                        Subject of Inquiry *
                      </label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-[#102A43] bg-white text-slate-900"
                      >
                        <option value="">Select a topic...</option>
                        <option value="Form One Admissions">Form One Admissions</option>
                        <option value="Transfer Request">Form 2 / Form 3 Transfer</option>
                        <option value="Academic Report Inquiries">Academic Results &amp; Reports</option>
                        <option value="School Fees & Bursar">School Fees &amp; Accounts</option>
                        <option value="Boarding Facilities">Boarding &amp; Student Welfare</option>
                        <option value="General Information">General Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#102A43] mb-1">
                      Your Message *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please write your inquiry or request details here..."
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-[#102A43] bg-white text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 bg-[#102A43] hover:bg-[#0A1C2E] text-white text-xs font-semibold rounded-md transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
