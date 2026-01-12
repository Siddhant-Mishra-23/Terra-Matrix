"use client";

const NewsLatterBox = () => {
  return (
    <div className="shadow-three dark:bg-gray-dark relative z-10 rounded-xs bg-white p-8 sm:p-11 lg:p-8 xl:p-11">
      <h3 className="mb-4 text-2xl leading-tight font-bold text-black dark:text-white">
        Subscribe to receive future updates
      </h3>
      <p className="border-body-color/25 text-body-color mb-11 border-b pb-11 text-base leading-relaxed dark:border-white/25">
        Lorem ipsum dolor sited Sed ullam corper consectur adipiscing Mae ornare
        massa quis lectus.
      </p>
      <div>
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          className="border-stroke text-body-color focus:border-primary dark:text-body-color-dark dark:shadow-two dark:focus:border-primary mb-4 w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="border-stroke text-body-color focus:border-primary dark:text-body-color-dark dark:shadow-two dark:focus:border-primary mb-4 w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
        />
        <input
          type="submit"
          value="Subscribe"
          className="bg-primary shadow-submit hover:bg-primary/90 dark:shadow-submit-dark mb-5 flex w-full cursor-pointer items-center justify-center rounded-xs px-9 py-4 text-base font-medium text-white duration-300"
        />
        <p className="text-body-color dark:text-body-color-dark text-center text-base leading-relaxed">
          No spam guaranteed, So please don’t send any spam mail.
        </p>
      </div>

      <div />
    </div>
  );
};

export default NewsLatterBox;
