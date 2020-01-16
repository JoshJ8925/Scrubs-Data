using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Requests;
using Sabio.Services;
using Sabio.Web.Controllers;
using Sabio.Web.Models.Responses;

namespace Sabio.Web.Api.Controllers
{
    [Route("api/faqs")]
    [ApiController]
    public class FAQApiController : BaseApiController
    {
        private IFAQService _service = null;
        private IAuthenticationService<int> _authService = null;
        public FAQApiController(IFAQService service, ILogger<FAQApiController> logger, IAuthenticationService<int> authService) : base(logger)
        {
            _service = service;
            _authService = authService;

        }

        [HttpPut("{id:int}")]
        public ActionResult<SuccessResponse> Update(FAQUpdateRequest model)
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                int userId = _authService.GetCurrentUserId();
                _service.Update(model, userId);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {

                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }

        [HttpPost]
        public ActionResult<ItemResponse<int>> Create(FAQAddRequest model)
        {
            int userId = _authService.GetCurrentUserId();


            ObjectResult result = null;

            try
            {
                int id = _service.Add(model, userId);
                ItemResponse<int> response = new ItemResponse<int> { Item = id };
                result = Created201(response);

            }
            catch (Exception ex)
            {
                ErrorResponse response = new ErrorResponse(ex.Message);
                result = StatusCode(500, response);
                base.Logger.LogError(ex.ToString());
            }

            return result;

        }

        [HttpGet]
        public ActionResult<ItemsResponse<List<FAQ>>> SelectAll()
        {
            BaseResponse response = null;
            int code = 200;

            try
            {
                List<FAQ> faqList = _service.GetAll();
                if (faqList == null)
                {
                    code = 404;
                    response = new ErrorResponse("Records Not Found");
                }
                else
                {
                    response = new ItemsResponse<FAQ> { Items = faqList };

                }
            }
            catch (Exception ex)

            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());

            }

            return StatusCode(code, response);
        }

        [HttpGet("{id:int}")]
        public ActionResult<ItemResponse<FAQ>> SelectById(int id)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                List<FAQ> faq = _service.GetById(id);

                if (faq == null)
                {
                    code = 404;
                    response = new ErrorResponse("Records not found.");
                }
                else
                {
                    response = new ItemsResponse<FAQ> { Items  = faq };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse(ex.Message);
            }
            return StatusCode(code, response);
        }

        [HttpDelete("{id:int}")]

        public ActionResult<SuccessResponse> Delete(int id)
        {
            BaseResponse response = null;
            int code = 200;
            try
            {
                _service.DeleteById(id);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }
            return StatusCode(code, response);
        }

        [HttpGet("details")]
        public ActionResult<ItemsResponse<FAQ>> SelectAllDetails()
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                List<FAQ> FAQList = _service.Get();

                if (FAQList == null)
                {
                    code = 404;
                    response = new ErrorResponse("Records not found");
                }
                else
                {
                    response = new ItemsResponse<FAQ> { Items = FAQList };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }


            return StatusCode(code, response);
        }

        [HttpGet("current")]
        public ActionResult<ItemResponse<Paged<FAQ>>> Select_ByCreatedBy(int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                int userId = _authService.GetCurrentUserId();
                Paged<FAQ> paged = _service.GetByCreatedBy(userId, pageIndex, pageSize);
                if (paged == null)
                {
                    code = 404;
                    response = new ErrorResponse("Records not found");
                }
                else
                {
                    response = new ItemResponse<Paged<FAQ>> { Item = paged };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }
            return StatusCode(code, response);
        }

        [HttpGet("categories")]
        public ActionResult<ItemsResponse<FAQ>> SelectAllCategories()
        {
            int code = 200;

            BaseResponse response = null;

            try
            {
                List<FAQCategories> catList = _service.GetCategories();

                if (catList == null)
                {
                    code = 404;
                    response = new ErrorResponse("Records not found");
                }
                else
                {
                    response = new ItemsResponse<FAQCategories> { Items = catList };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }
            
            return StatusCode(code, response);
        }
    }
}
