using System.Collections.Generic;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Requests;

namespace Sabio.Services
{
    public interface IFAQService
    {
        void Update(FAQUpdateRequest model, int userId);
        int Add(FAQAddRequest model, int userId);
        List<FAQ> GetAll();
        List<FAQ> GetById(int id);
        void DeleteById(int id);
        List<FAQ> Get();
        Paged<FAQ> GetByCreatedBy(int createdBy, int pageIndex, int pageSize);
        List<FAQCategories> GetCategories();
    }
}
