const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const {executeJudge0} = require("../utils/problemUtility");

const judge0StatusToSubmissionStatus = {
  4: 'wrong_answer',
  5: 'time_limit_exceeded',
  6: 'compilation_error',
  7: 'runtime_error',
  8: 'runtime_error',
  9: 'runtime_error',
  10: 'runtime_error',
  11: 'runtime_error',
  12: 'runtime_error',
  13: 'internal_error',
  14: 'runtime_error',
  15: 'memory_limit_exceeded'
};

const getSubmissionStatus = (judge0StatusId) => (
  judge0StatusToSubmissionStatus[judge0StatusId] || 'internal_error'
);

const submitCode = async (req,res)=>{
   
    // 
    try{
      
       const userId = req.result._id;
       const problemId = req.params.id;

       let {code,language} = req.body;

      if(!userId||!code||!problemId||!language)
        return res.status(400).send("Some field missing");
      

      if(language==='cpp')
        language='c++'
      
      // console.log(language);
      
    //    Fetch the problem from database
       const problem =  await Problem.findById(problemId);
       if(!problem)
        return res.status(404).send("Problem not found");
    //    testcases(Hidden)
    
    //   Kya apne submission store kar du pehle....
    const submittedResult = await Submission.create({
          userId,
          problemId,
          code,
          language,
          status:'pending',
          testCasesTotal:problem.hiddenTestCases.length
     })

    //    Judge0 code ko submit karna hai
    
    const testResult = await executeJudge0(code, language, problem.hiddenTestCases);
    

    // submittedResult ko update karo
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;


    for(const test of testResult){
        if(test.status_id==3){
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
          status = getSubmissionStatus(test.status_id);
          errorMessage = test.stderr
        }
    }


    // Store the result in Database in Submission
    submittedResult.status   = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();
    
    // ProblemId ko insert karenge userSchema ke problemSolved mein if it is not persent there.
    
    // req.result == user Information

    const accepted = (status == 'accepted')

    if(accepted){
      await User.findByIdAndUpdate(userId, {
        $addToSet: { problemSolved: problemId }
      });
    }

    res.status(201).json({
      accepted,
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory
    });
       
    }
    catch(err){
      res.status(500).send("Internal Server Error "+ err);
    }
}


const runCode = async(req,res)=>{
    
     // 
     try{
      const userId = req.result._id;
      const problemId = req.params.id;

      let {code,language} = req.body;

     if(!userId||!code||!problemId||!language)
       return res.status(400).send("Some field missing");

   //    Fetch the problem from database
      const problem =  await Problem.findById(problemId);
      if(!problem)
        return res.status(404).send("Problem not found");
   //    testcases(Hidden)
      if(language==='cpp')
        language='c++'

   //    Judge0 code ko submit karna hai

   const testResult = await executeJudge0(code, language, problem.visibleTestCases);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;

    for(const test of testResult){
        if(test.status_id==3){
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
          status = getSubmissionStatus(test.status_id);
          errorMessage = test.stderr
        }
    }

   
  
   res.status(201).json({
    success:status == 'accepted',
    testCases: testResult,
    runtime,
    memory
   });
      
   }
   catch(err){
     res.status(500).send("Internal Server Error "+ err);
   }
}


module.exports = {submitCode,runCode};

