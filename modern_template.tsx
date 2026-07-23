  if (template === "modern") {
    return (
      <div className="flex min-h-[1123px] w-full bg-white text-[#333] m-0 p-0 relative text-[13px] leading-normal" style={{ fontFamily: "system-ui, sans-serif" }}>
        
        {/* Left Sidebar */}
        <div className="w-[35%] flex flex-col items-center gap-8 px-8 pb-8 pt-10" style={{ backgroundColor: "#e6e6e6" }}>
          {/* Profile Photo */}
          {resume.photoUrl ? (
            <img
              src={resume.photoUrl}
              alt="Profile"
              className={`w-40 h-40 object-cover border-[4px] border-white shadow-md z-10 ${shapeClass}`}
            />
          ) : (
            <div className="w-40 h-40" /> /* Spacer if no photo */
          )}

          <div className="w-full flex flex-col gap-8 mt-2">
            {/* CONTACT */}
            {(resume.contact?.phone || resume.contact?.email || resume.contact?.location || (resume.contact?.links && resume.contact.links.length > 0)) ? (
              <div>
                <h2 className="text-[15px] font-bold tracking-[0.15em] uppercase mb-4 pb-2 border-b-2 border-black text-black">
                  Contact
                </h2>
                <div className="flex flex-col gap-4 text-[13px] text-black font-medium leading-relaxed">
                  {resume.contact?.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white shrink-0"><Phone size={12} /></div>
                      <span>{resume.contact.phone}</span>
                    </div>
                  )}
                  {resume.contact?.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white shrink-0"><Mail size={12} /></div>
                      <span className="truncate">{resume.contact.email}</span>
                    </div>
                  )}
                  {resume.contact?.location && (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white shrink-0"><MapPin size={12} /></div>
                      <span>{resume.contact.location}</span>
                    </div>
                  )}
                  {resume.contact?.links?.map((link, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white shrink-0"><span className="text-[10px]">🔗</span></div>
                      <span className="truncate">{link}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* SKILLS */}
            {resume.skills && resume.skills.length > 0 && (
              <div>
                <h2 className="text-[15px] font-bold tracking-[0.15em] uppercase mb-4 pb-2 border-b-2 border-black text-black">
                  Skills
                </h2>
                <ul className="flex flex-col gap-2">
                  {resume.skills.map((s, i) => (
                    <li key={i} className="flex items-center gap-3 text-[13px] text-[#333] font-medium leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* LANGUAGES */}
            {resume.languages && resume.languages.length > 0 && (
              <div>
                <h2 className="text-[15px] font-bold tracking-[0.15em] uppercase mb-4 pb-2 border-b-2 border-black text-black">
                  Languages
                </h2>
                <ul className="flex flex-col gap-2">
                  {resume.languages.map((lang, i) => (
                    <li key={i} className="flex items-center gap-3 text-[13px] text-[#333] font-medium leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                      {lang}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* CERTIFICATIONS */}
            {resume.certifications && resume.certifications.length > 0 && (
              <div>
                <h2 className="text-[15px] font-bold tracking-[0.15em] uppercase mb-4 pb-2 border-b-2 border-black text-black">
                  Certifications
                </h2>
                <ul className="flex flex-col gap-2">
                  {resume.certifications.map((c, i) => (
                    <li key={i} className="flex gap-3 text-[13px] text-[#333] font-medium leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-1.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="w-[65%] flex flex-col bg-white">
          {/* Header */}
          <div className="w-full pt-16 pb-12 px-10 text-white flex flex-col justify-center" style={{ backgroundColor: accent, minHeight: "180px" }}>
            <h1 className="text-4xl font-bold tracking-widest uppercase leading-snug">{resume.name}</h1>
            {resume.title && (
              <p className="text-base tracking-widest uppercase mt-2 opacity-90">{resume.title}</p>
            )}
          </div>

          <div className="p-10 flex flex-col gap-8 text-[#111] overflow-hidden">
            {/* PROFILE */}
            {resume.summary && (
              <div className="flex gap-6 relative">
                <div className="relative flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white z-10 shrink-0 shadow-sm" style={{ backgroundColor: accent }}>
                    <User size={20} />
                  </div>
                  <div className="w-px h-full bg-black opacity-30 absolute top-11" />
                </div>
                <div className="flex-1 pb-4">
                  <h2 className="text-xl font-bold tracking-[0.15em] uppercase mb-4 text-black pt-2">
                    Profile
                  </h2>
                  <p className="text-[13px] leading-relaxed text-[#555] text-justify">
                    {resume.summary}
                  </p>
                </div>
              </div>
            )}

            {/* EXPERIENCE */}
            {resume.experience && resume.experience.length > 0 && (
              <div className="flex gap-6 relative">
                <div className="relative flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white z-10 shrink-0 shadow-sm" style={{ backgroundColor: accent }}>
                    <Briefcase size={20} />
                  </div>
                  <div className="w-px h-full bg-black opacity-30 absolute top-11" />
                </div>
                <div className="flex-1 pb-6">
                  <h2 className="text-xl font-bold tracking-[0.15em] uppercase mb-6 text-black pt-2">
                    Work Experience
                  </h2>
                  <div className="flex flex-col gap-8 relative">
                    {resume.experience.map((exp, i) => (
                      <div key={i} className="relative">
                        {/* Small timeline dot */}
                        <div className="absolute top-1.5 -left-[45px] w-3 h-3 rounded-full border-2 border-[#555] bg-white z-10" />
                        
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-base text-black">
                            {exp.company}
                          </h3>
                          <span className="text-[13px] text-black font-medium">{exp.period}</span>
                        </div>
                        <div className="text-[14px] text-[#555] mb-3 leading-relaxed">
                          {exp.role}
                        </div>
                        {exp.bullets && exp.bullets.length > 0 && (
                          <ul className="flex flex-col gap-2">
                            {exp.bullets.map((b, j) => (
                              <li key={j} className="text-[13px] leading-relaxed text-[#555] flex gap-2">
                                <span className="text-black text-[10px] mt-1.5">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* EDUCATION */}
            {resume.education && resume.education.length > 0 && (
              <div className="flex gap-6 relative">
                <div className="relative flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white z-10 shrink-0 shadow-sm" style={{ backgroundColor: accent }}>
                    <GraduationCap size={20} />
                  </div>
                </div>
                <div className="flex-1 pb-2">
                  <h2 className="text-xl font-bold tracking-[0.15em] uppercase mb-6 text-black pt-2">
                    Education
                  </h2>
                  <div className="flex flex-col gap-8 relative">
                    {resume.education.map((ed, i) => (
                      <div key={i} className="relative">
                        {/* Small timeline dot */}
                        <div className="absolute top-1.5 -left-[45px] w-3 h-3 rounded-full border-2 border-[#555] bg-white z-10" />
                        
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-base text-black">
                            {ed.degree}
                          </h3>
                          <span className="text-[13px] text-black font-medium">{ed.period}</span>
                        </div>
                        <div className="text-[14px] text-[#555] mb-1 leading-relaxed">
                          {ed.institution}
                        </div>
                        {ed.details && (
                          <p className="text-[13px] text-[#555] italic leading-relaxed">
                            {ed.details}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
