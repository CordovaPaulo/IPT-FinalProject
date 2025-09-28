'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import './learnmore.css'; 

interface FAQ {
  question: string;
  answer: string;
  open: boolean;
}

export default function LearnMore() {
  const router = useRouter();
  const [activeIcon, setActiveIcon] = useState(0);
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      question: "Who can use MindMates?",
      answer:
        "MindMates is exclusively available to College of Computer Studies students of Gordon College. It is designed to help students connect with peers for tutoring and educational support.",
      open: false,
    },
    {
      question: "How do I become a mentor or learner?",
      answer:
        "To become a mentor or learner, you need to create two separate accounts using the same email and password — one for each role. This allows you to switch between mentoring and learning as needed.",
      open: false,
    },
    {
      question: "Is there a fee to use MindMates?",
      answer: "No, MindMates is completely free to use.",
      open: false,
    },
    {
      question: "How do I book a session?",
      answer:
        "Once you find a mentor, you can schedule a session as long as they are available on your preferred day and time. Simply choose a suitable slot and you're good to go.",
      open: false,
    },
    {
      question: "Can I cancel or reschedule a session?",
      answer:
        "Yes, you can cancel or reschedule a session through the session details page. However, we encourage timely communication to avoid inconveniencing mentors or learners.",
      open: false,
    },
    {
      question: "How does the rating system work?",
      answer:
        "After each session, learners can leave a rating and feedback based on their experience. Ratings help maintain quality and allow mentors to improve their tutoring approach.",
      open: false,
    },
    {
      question: "Is there a messaging feature?",
      answer:
        "Yes, MindMates allows users to send messages within the platform. However, instead of a chat system, messages are delivered via email to the recipient, ensuring important details are not missed.",
      open: false,
    },
    {
      question: "What types of subjects can I find on MindMates?",
      answer:
        "MindMates covers the subjects offered by the different programs in the Department of College of Computer Studies - Gordon College.",
      open: false,
    },
    {
      question: "How secure is MindMates?",
      answer:
        "MindMates uses secure protocols to protect user data. We continuously implement measures to keep your information secure.",
      open: false,
    },
    {
      question: "What if I encounter an issue or need help?",
      answer:
        "If you face any issues or need assistance, you can reach out through our support feature. We're here to ensure you have a smooth experience.",
      open: false,
    },
  ]);

  const toggleFaq = (index: number) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index].open = !updatedFaqs[index].open;
    setFaqs(updatedFaqs);
  };

  const goBack = () => {
    router.push('/');
  };

  return (
    <div className="learnmore-container">
      <Navbar />

      <div className="system-explanation">
        <button className="back-button" onClick={goBack}>
          <i className="fas fa-arrow-left back-icon"></i>
        </button>

        <h1 className="title animated-title">HOW OUR SYSTEM WORKS</h1>
        <div className="divider animated-divider"></div>

        <div className="intro-container">
          <Image
            src="/logo_gccoed.png"
            alt="MindMates Logo"
            width={280}
            height={100}
            className="logo animated-logo"
          />
          <p className="intro animated-description">
            MindMates is a web-based platform proposed to make the process of finding
            and scheduling peer-to-peer tutoring sessions efficient within our
            school community. With easy access for all students, it allows anyone
            to offer and receive tutoring in various subjects, book sessions at
            their convenience, and stay organized in their learning journey.
          </p>
        </div>

        <div className="divider tight-divider animated-divider"></div>

        {/* Features */}
        <div className="content-wrapper">
          <div className="feature-row">
            <div className="icon-container">
              <Image
                src="/icon1.png"
                alt="Icon1"
                width={130}
                height={100}
                className="feature-icon animated-icon"
              />
            </div>
            <div className="feature-section">
              <h3 className="feature-title animated-text">
                Find the Right Mentor or Learner
              </h3>
              <p className="feature-description animated-text">
                Students looking for guidance can search for mentors based on
                subjects, expertise, and availability. Filtering options allow
                users to narrow down their choices and find the most suitable
                match.
              </p>
            </div>
          </div>

          <div className="feature-row">
            <div className="icon-container">
              <Image
                src="/icon3.png"
                alt="Icon3"
                width={130}
                height={100}
                className="feature-icon animated-icon"
              />
            </div>
            <div className="feature-section">
              <h3 className="feature-title animated-text">Connect and Learn</h3>
              <p className="feature-description animated-text">
                Once a student finds a potential mentor, they can view their
                profile to learn more about their experience and qualifications.
                Communication is done via email, where both parties can discuss
                learning goals, session details, and scheduling.
              </p>
            </div>
          </div>

          <div className="feature-row">
            <div className="icon-container">
              <Image
                src="/icon4.png"
                alt="Icon4"
                width={130}
                height={100}
                className="feature-icon animated-icon"
              />
            </div>
            <div className="feature-section">
              <h3 className="feature-title animated-text">
                Schedule and Begin Sessions
              </h3>
              <p className="feature-description animated-text">
                After finalizing the details, students and mentors can arrange
                tutoring sessions at convenient times. Sessions can be adjusted
                or rescheduled as needed to ensure a smooth learning experience.
              </p>
            </div>
          </div>
        </div>

        <div className="divider animated-divider"></div>

        {/* Unique features */}
        <div className="unique-features">
          <h2 className="section-title">What Makes MindMates Different?</h2>
          <p className="section-description">
            MindMates is more than just a tutoring platform—it's a student-driven
            learning space designed specifically for our school community. Unlike
            other tutoring services, MindMates is built on peer-assisted learning,
            allowing students to be both learners and mentors, fostering a
            collaborative academic environment.
          </p>

          <div className="numbered-icons">
            {[ 
              "Peer-to-Peer Learning", 
              "School-Specific Platform", 
              "Flexible Learning", 
              "Comfortable Learning"
            ].map((text, i) => (
              <div
                key={i}
                className="icon-wrapper"
                onMouseEnter={() => setActiveIcon(i + 1)}
                onMouseLeave={() => setActiveIcon(0)}
              >
                <div className="icon-circle">{i + 1}</div>
                <div className={`icon-text ${activeIcon === i + 1 ? 'active' : ''}`}>
                  {text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="divider animated-divider"></div>

        {/* FAQs */}
        <div className="faq-section">
          <h2 className="section-title">FAQs</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="faq-item"
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question">
                  {faq.question}
                  <i
                    className={`fas ${faq.open ? 'fa-chevron-up' : 'fa-chevron-down'}`}
                  ></i>
                </div>
                <div className={`faq-answer ${faq.open ? 'open' : ''}`}>
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
