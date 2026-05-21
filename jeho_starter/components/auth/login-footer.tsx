import Link from "next/link";
import Image from "next/image";
import logo2 from "@/public/images/small logo WHITE.png";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";


export function LoginFooter() {
  return (
    <footer className='bg-[#143B4A] text-white py-4 lg:py-8 px-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center lg:justify-between gap-8 lg:gap-4'>
            <div className='flex items-center space-x-3 justify-center sm:justify-start'>
              <div className='w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center'>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
                </svg>
              </div>
              <div>
                <div className='text-sm text-teal-100'>Contact Support</div>
                <div className='font-semibold whitespace-nowrap'>support@jehostarter.com</div>
              </div>
            </div>

            <div className='flex items-center space-x-3 justify-center sm:justify-start'>
              <div className='w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center shrink-0'>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                  <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                </svg>
              </div>
              <div>
                <div className='text-sm text-teal-100'>Email address</div>
                <div className='font-semibold break-all sm:break-normal'>jehostarter@gmail.com</div>
              </div>
            </div>

            <div className='text-center sm:text-left'>
              <Link href="/">
                <h3 className='font-semibold text-white hover:text-teal-300 text-sm sm:text-base cursor-pointer'>
                  About Us
                </h3>
              </Link>
            </div>

            <div className='flex flex-col items-center sm:items-start gap-3'>
              <div className='text-sm text-teal-100'>Follow us on social:</div>
              <div className='flex space-x-2'>
                <Link href='#'>
                  <div className='w-8 h-8 bg-white hover:bg-teal-200 rounded-full flex items-center justify-center cursor-pointer'>
                    <FaFacebook className='text-[#143B4A] w-4 h-4' />
                  </div>
                </Link>
                <Link href='#'>
                  <div className='w-8 h-8 bg-white hover:bg-teal-200 rounded-full flex items-center justify-center cursor-pointer'>
                    <FaInstagram className='text-[#143B4A] w-4 h-4' />
                  </div>
                </Link>
                <Link href='#'>
                  <div className='w-8 h-8 bg-white hover:bg-teal-200 rounded-full flex items-center justify-center cursor-pointer'>
                    <FaTwitter className='text-[#143B4A] w-4 h-4' />
                  </div>
                </Link>
                <Link href='#'>
                  <div className='w-8 h-8 bg-white hover:bg-teal-200 rounded-full flex items-center justify-center cursor-pointer'>
                    <FaLinkedin className='text-[#143B4A] w-4 h-4' />
                  </div>
                </Link>
              </div>
            </div>

            <div className='flex items-center justify-center lg:justify-end col-span-1 sm:col-span-2 lg:col-span-1 mt-4 sm:mt-0'>
              <Image src={logo2} alt='logo2' className='w-28 h-auto sm:w-32' />
            </div>
          </div>
        </div>
      </footer>
  );
}